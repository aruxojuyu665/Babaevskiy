import { normalizePhone, type Lead, type LeadInput } from "../lead/schema";

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

type LeadOf<T extends LeadInput["type"]> = Omit<Lead, "input"> & {
  input: Extract<LeadInput, { type: T }>;
};

export function renderLeadEmail(lead: Lead): EmailContent {
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

function renderCallback(lead: LeadOf<"callback">): EmailContent {
  const phone = normalizePhone(lead.input.phone);
  const source = lead.input.source ?? "не указан";
  const subject = `Заявка на перезвон — ${phone}`;
  const rows: Array<[string, string]> = [
    ["Тип", "Перезвон"],
    ["Телефон", phone],
    ["Источник формы", formatSource(source)],
    ["Время", formatTimestamp(lead.timestamp)],
    ["ID заявки", lead.id],
  ];
  return {
    subject,
    text: rowsToText(rows),
    html: wrapHtml("Заявка на перезвон", rows),
  };
}

function renderCalculator(lead: LeadOf<"calculator">): EmailContent {
  const { input } = lead;
  const phone = normalizePhone(input.phone);
  const subject = `Заявка на ремонт — ${input.name}, ${input.furnitureType}`;
  const rows: Array<[string, string]> = [
    ["Тип", "Расчёт ремонта"],
    ["Имя", input.name],
    ["Телефон", phone],
    ["Мебель", input.furnitureType],
    ["Комментарий", input.comment ?? "—"],
    ["Фото", lead.photos.length > 0 ? `${lead.photos.length} шт. (во вложении)` : "нет"],
    ["Время", formatTimestamp(lead.timestamp)],
    ["ID заявки", lead.id],
  ];
  return {
    subject,
    text: rowsToText(rows),
    html: wrapHtml("Заявка на расчёт ремонта", rows),
  };
}

function renderCorporate(lead: LeadOf<"corporate">): EmailContent {
  const phone = normalizePhone(lead.input.phone);
  const subject = `Корпоративная заявка — ${phone}`;
  const rows: Array<[string, string]> = [
    ["Тип", "Корпоративный заказ"],
    ["Телефон", phone],
    ["Время", formatTimestamp(lead.timestamp)],
    ["ID заявки", lead.id],
  ];
  return {
    subject,
    text: rowsToText(rows),
    html: wrapHtml("Корпоративная заявка", rows),
  };
}

function renderFabricSamples(lead: LeadOf<"fabric-samples">): EmailContent {
  const phone = normalizePhone(lead.input.phone);
  const subject = `Запрос образцов тканей — ${phone}`;
  const rows: Array<[string, string]> = [
    ["Тип", "Образцы тканей"],
    ["Телефон", phone],
    ["Время", formatTimestamp(lead.timestamp)],
    ["ID заявки", lead.id],
  ];
  return {
    subject,
    text: rowsToText(rows),
    html: wrapHtml("Запрос образцов тканей", rows),
  };
}

function formatSource(source: string): string {
  if (source === "hero") return "Главный блок (Hero)";
  if (source === "contacts") return "Блок «Контакты» внизу";
  return source;
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

function rowsToText(rows: Array<[string, string]>): string {
  return rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}

function wrapHtml(title: string, rows: Array<[string, string]>): string {
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#666;font-weight:500;white-space:nowrap;">${escapeHtml(
          k
        )}</td><td style="padding:6px 0;vertical-align:top;color:#111;">${escapeHtml(v)}</td></tr>`
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.5;color:#111;">
<div style="max-width:560px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;border:1px solid #eee;">
<h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#111;">${escapeHtml(title)}</h1>
<table style="width:100%;border-collapse:collapse;">${body}</table>
</div></body></html>`;
}

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
