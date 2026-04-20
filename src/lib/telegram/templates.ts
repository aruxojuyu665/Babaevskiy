import { normalizePhone, type Lead, type LeadInput } from "../lead/schema";

export interface TelegramMessage {
  text: string;
  parseMode: "HTML";
}

type LeadOf<T extends LeadInput["type"]> = Omit<Lead, "input"> & {
  input: Extract<LeadInput, { type: T }>;
};

export function renderLeadTelegram(lead: Lead): TelegramMessage {
  const input = lead.input;
  switch (input.type) {
    case "callback":
      return renderCallback({ ...lead, input });
    case "calculator":
      return renderCalculator({ ...lead, input });
    case "corporate":
      return renderCorporate({ ...lead, input });
    case "fabric-samples":
      return renderFabricSamples({ ...lead, input });
  }
}

function renderCallback(lead: LeadOf<"callback">): TelegramMessage {
  const phone = normalizePhone(lead.input.phone);
  const source = formatSource(lead.input.source);
  const rows: Array<[string, string]> = [
    ["Телефон", phone],
    ["Источник", source],
    ["Время", formatTimestamp(lead.timestamp)],
    ["ID", lead.id],
  ];
  return buildMessage("📞 Заявка на перезвон", rows);
}

function renderCalculator(lead: LeadOf<"calculator">): TelegramMessage {
  const { input } = lead;
  const phone = normalizePhone(input.phone);
  const rows: Array<[string, string]> = [
    ["Имя", input.name],
    ["Телефон", phone],
    ["Мебель", input.furnitureType],
    ["Комментарий", input.comment?.trim() ? input.comment : "—"],
    [
      "Фото",
      lead.photos.length > 0 ? `${lead.photos.length} шт. (во вложении)` : "нет",
    ],
    ["Время", formatTimestamp(lead.timestamp)],
    ["ID", lead.id],
  ];
  return buildMessage("🛠 Заявка на расчёт ремонта", rows);
}

function renderCorporate(lead: LeadOf<"corporate">): TelegramMessage {
  const phone = normalizePhone(lead.input.phone);
  const rows: Array<[string, string]> = [
    ["Телефон", phone],
    ["Время", formatTimestamp(lead.timestamp)],
    ["ID", lead.id],
  ];
  return buildMessage("🏢 Корпоративная заявка", rows);
}

function renderFabricSamples(lead: LeadOf<"fabric-samples">): TelegramMessage {
  const phone = normalizePhone(lead.input.phone);
  const rows: Array<[string, string]> = [
    ["Телефон", phone],
    ["Время", formatTimestamp(lead.timestamp)],
    ["ID", lead.id],
  ];
  return buildMessage("🧵 Запрос образцов тканей", rows);
}

function formatSource(source: string | undefined): string {
  if (source === "hero") return "Главный блок (Hero)";
  if (source === "contacts") return "Блок «Контакты» внизу";
  return source ?? "не указан";
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      dateStyle: "short",
      timeStyle: "medium",
    });
  } catch {
    return iso;
  }
}

function buildMessage(
  title: string,
  rows: Array<[string, string]>
): TelegramMessage {
  const header = `<b>${escapeHtml(title)}</b>`;
  const body = rows
    .map(([k, v]) => `<b>${escapeHtml(k)}:</b> ${escapeHtml(v)}`)
    .join("\n");
  return { text: `${header}\n\n${body}`, parseMode: "HTML" };
}

export function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
