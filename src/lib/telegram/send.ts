import type { Lead, LeadPhotoAttachment } from "../lead/schema";
import { loadTelegramConfig, type TelegramConfig } from "./config";
import { renderLeadTelegram } from "./templates";

const TELEGRAM_CAPTION_LIMIT = 1024;
const TELEGRAM_TEXT_LIMIT = 4096;
const MEDIA_GROUP_MAX = 10;
const DEFAULT_TIMEOUT_MS = 10_000;

export interface TelegramSendResult {
  messageIds: number[];
  chatId: string;
}

interface TelegramApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

interface TelegramMessage {
  message_id: number;
}

export class TelegramSendError extends Error {
  readonly status?: number;
  readonly description?: string;
  constructor(message: string, status?: number, description?: string) {
    super(message);
    this.name = "TelegramSendError";
    this.status = status;
    this.description = description;
  }
}

export async function sendLeadTelegram(
  lead: Lead,
  config: TelegramConfig = loadTelegramConfig(),
  fetchImpl: typeof fetch = fetch
): Promise<TelegramSendResult> {
  const content = renderLeadTelegram(lead);
  const messageIds: number[] = [];

  if (lead.photos.length === 0) {
    const id = await sendTextMessage(config, content.text, fetchImpl);
    messageIds.push(id);
    return { messageIds, chatId: config.chatId };
  }

  const photoChunks = chunk(lead.photos, MEDIA_GROUP_MAX);
  let captionUsed = false;

  for (const group of photoChunks) {
    const caption = captionUsed ? undefined : content.text;
    captionUsed = true;
    const ids = await sendMediaGroup(config, group, caption, fetchImpl);
    messageIds.push(...ids);
  }

  // If the caption overflowed the Telegram caption limit we still want the
  // full text delivered — send it as a follow-up text message.
  if (content.text.length > TELEGRAM_CAPTION_LIMIT) {
    const id = await sendTextMessage(config, content.text, fetchImpl);
    messageIds.push(id);
  }

  return { messageIds, chatId: config.chatId };
}

async function sendTextMessage(
  config: TelegramConfig,
  text: string,
  fetchImpl: typeof fetch
): Promise<number> {
  const payload = {
    chat_id: config.chatId,
    text: truncate(text, TELEGRAM_TEXT_LIMIT),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  const response = await callApi<TelegramMessage>(
    config,
    "sendMessage",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    fetchImpl
  );
  return response.message_id;
}

async function sendMediaGroup(
  config: TelegramConfig,
  photos: LeadPhotoAttachment[],
  caption: string | undefined,
  fetchImpl: typeof fetch
): Promise<number[]> {
  if (photos.length === 1) {
    const id = await sendSinglePhoto(config, photos[0]!, caption, fetchImpl);
    return [id];
  }

  const form = new FormData();
  form.set("chat_id", config.chatId);

  const media = photos.map((photo, index) => {
    const attachKey = `photo${index}`;
    form.set(
      attachKey,
      new Blob([new Uint8Array(photo.buffer)], { type: photo.contentType }),
      photo.filename
    );
    const entry: Record<string, string> = {
      type: "photo",
      media: `attach://${attachKey}`,
    };
    if (index === 0 && caption) {
      entry.caption = truncate(caption, TELEGRAM_CAPTION_LIMIT);
      entry.parse_mode = "HTML";
    }
    return entry;
  });
  form.set("media", JSON.stringify(media));

  const result = await callApi<TelegramMessage[]>(
    config,
    "sendMediaGroup",
    { method: "POST", body: form },
    fetchImpl
  );
  return result.map((m) => m.message_id);
}

async function sendSinglePhoto(
  config: TelegramConfig,
  photo: LeadPhotoAttachment,
  caption: string | undefined,
  fetchImpl: typeof fetch
): Promise<number> {
  const form = new FormData();
  form.set("chat_id", config.chatId);
  form.set(
    "photo",
    new Blob([new Uint8Array(photo.buffer)], { type: photo.contentType }),
    photo.filename
  );
  if (caption) {
    form.set("caption", truncate(caption, TELEGRAM_CAPTION_LIMIT));
    form.set("parse_mode", "HTML");
  }
  const result = await callApi<TelegramMessage>(
    config,
    "sendPhoto",
    { method: "POST", body: form },
    fetchImpl
  );
  return result.message_id;
}

async function callApi<T>(
  config: TelegramConfig,
  method: string,
  init: RequestInit,
  fetchImpl: typeof fetch
): Promise<T> {
  const url = `${config.apiBase}/bot${config.token}/${method}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetchImpl(url, { ...init, signal: controller.signal });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "network error";
    throw new TelegramSendError(`Telegram ${method} не выполнен: ${reason}`);
  } finally {
    clearTimeout(timer);
  }

  let parsed: TelegramApiResponse<T>;
  try {
    parsed = (await response.json()) as TelegramApiResponse<T>;
  } catch {
    throw new TelegramSendError(
      `Telegram ${method}: ответ не JSON (HTTP ${response.status})`,
      response.status
    );
  }

  if (!response.ok || !parsed.ok || parsed.result === undefined) {
    throw new TelegramSendError(
      `Telegram ${method} отклонён: ${parsed.description ?? `HTTP ${response.status}`}`,
      response.status,
      parsed.description
    );
  }
  return parsed.result;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit - 1) + "…";
}
