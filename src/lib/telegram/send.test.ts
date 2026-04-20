import { describe, expect, it, vi } from "vitest";
import { sendLeadTelegram, TelegramSendError } from "./send";
import type { Lead } from "../lead/schema";
import type { TelegramConfig } from "./config";

const config: TelegramConfig = {
  token: "8316574746:AAGbBNnf9W4Ua50yDJ9xr5eMmJegOZZms1E",
  chatId: "-1001234567890",
  apiBase: "https://api.telegram.org",
};

function makeLead(photos: Lead["photos"] = []): Lead {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    timestamp: "2026-04-17T10:00:00.000Z",
    input: { type: "callback", phone: "+79991234567", source: "hero" },
    photos,
  };
}

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify({ ok: true, result: body }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("sendLeadTelegram", () => {
  it("sends a text message when there are no photos", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      okResponse({ message_id: 42 })
    );
    const result = await sendLeadTelegram(makeLead(), config, fetchMock);

    expect(result).toEqual({ messageIds: [42], chatId: config.chatId });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(
      `${config.apiBase}/bot${config.token}/sendMessage`
    );
    expect(init?.method).toBe("POST");
    const body = JSON.parse(String(init?.body));
    expect(body.chat_id).toBe(config.chatId);
    expect(body.parse_mode).toBe("HTML");
    expect(body.text).toContain("Заявка на перезвон");
  });

  it("sends sendPhoto with multipart for a single photo", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      okResponse({ message_id: 7 })
    );
    const lead: Lead = {
      ...makeLead(),
      input: {
        type: "calculator",
        phone: "+79991234567",
        name: "Иван",
        furnitureType: "Диван",
        photoCount: 1,
      },
      photos: [
        { filename: "a.jpg", contentType: "image/jpeg", size: 3, buffer: Buffer.from([1, 2, 3]) },
      ],
    };
    const result = await sendLeadTelegram(lead, config, fetchMock);

    expect(result.messageIds).toEqual([7]);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/sendPhoto");
    expect(init?.body).toBeInstanceOf(FormData);
    const form = init!.body as FormData;
    expect(form.get("chat_id")).toBe(config.chatId);
    expect(form.get("caption")).toContain("расчёт ремонта");
    expect(form.get("photo")).toBeInstanceOf(Blob);
  });

  it("sends sendMediaGroup for multiple photos", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      okResponse([{ message_id: 10 }, { message_id: 11 }])
    );
    const lead: Lead = {
      ...makeLead(),
      input: {
        type: "calculator",
        phone: "+79991234567",
        name: "Иван",
        furnitureType: "Диван",
        photoCount: 2,
      },
      photos: [
        { filename: "a.jpg", contentType: "image/jpeg", size: 3, buffer: Buffer.from([1]) },
        { filename: "b.jpg", contentType: "image/jpeg", size: 3, buffer: Buffer.from([2]) },
      ],
    };
    const result = await sendLeadTelegram(lead, config, fetchMock);

    expect(result.messageIds).toEqual([10, 11]);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/sendMediaGroup");
    const form = init!.body as FormData;
    const media = JSON.parse(String(form.get("media"))) as Array<Record<string, string>>;
    expect(media).toHaveLength(2);
    expect(media[0]!.media).toBe("attach://photo0");
    expect(media[0]!.caption).toContain("расчёт ремонта");
    expect(media[1]!.caption).toBeUndefined();
    expect(form.get("photo0")).toBeInstanceOf(Blob);
    expect(form.get("photo1")).toBeInstanceOf(Blob);
  });

  it("throws TelegramSendError when API returns ok:false", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({ ok: false, description: "chat not found", error_code: 400 }),
        { status: 400, headers: { "content-type": "application/json" } }
      )
    );
    await expect(sendLeadTelegram(makeLead(), config, fetchMock)).rejects.toThrow(
      TelegramSendError
    );
  });

  it("throws TelegramSendError on network failure", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("ECONNRESET"));
    await expect(sendLeadTelegram(makeLead(), config, fetchMock)).rejects.toThrow(
      /ECONNRESET/
    );
  });
});
