import { describe, expect, it } from "vitest";
import { renderLeadTelegram } from "./templates";
import type { Lead } from "../lead/schema";

function baseLead(): Pick<Lead, "id" | "timestamp" | "photos"> {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    timestamp: "2026-04-17T10:00:00.000Z",
    photos: [],
  };
}

describe("renderLeadTelegram", () => {
  it("renders callback with phone and source", () => {
    const msg = renderLeadTelegram({
      ...baseLead(),
      input: { type: "callback", phone: "+79991234567", source: "hero" },
    });
    expect(msg.parseMode).toBe("HTML");
    expect(msg.text).toContain("Заявка на перезвон");
    expect(msg.text).toContain("+7 (999) 123-45-67");
    expect(msg.text).toContain("Главный блок (Hero)");
  });

  it("renders contacts source label", () => {
    const msg = renderLeadTelegram({
      ...baseLead(),
      input: { type: "callback", phone: "+79991234567", source: "contacts" },
    });
    expect(msg.text).toContain("Контакты");
  });

  it("renders calculator lead with attachments count", () => {
    const msg = renderLeadTelegram({
      ...baseLead(),
      input: {
        type: "calculator",
        phone: "+79991234567",
        name: "Иван",
        furnitureType: "Диван прямой",
        comment: "Порвалась обивка",
        photoCount: 2,
      },
      photos: [
        { filename: "a.jpg", contentType: "image/jpeg", size: 100, buffer: Buffer.from([]) },
        { filename: "b.jpg", contentType: "image/jpeg", size: 100, buffer: Buffer.from([]) },
      ],
    });
    expect(msg.text).toContain("расчёт ремонта");
    expect(msg.text).toContain("Иван");
    expect(msg.text).toContain("Диван прямой");
    expect(msg.text).toContain("Порвалась обивка");
    expect(msg.text).toContain("2 шт. (во вложении)");
  });

  it("shows dash for empty comment and no photos", () => {
    const msg = renderLeadTelegram({
      ...baseLead(),
      input: {
        type: "calculator",
        phone: "+79991234567",
        name: "Иван",
        furnitureType: "Кресло",
        photoCount: 0,
      },
    });
    expect(msg.text).toContain("Комментарий:</b> —");
    expect(msg.text).toContain("Фото:</b> нет");
  });

  it("renders corporate and fabric-samples titles", () => {
    const corp = renderLeadTelegram({
      ...baseLead(),
      input: { type: "corporate", phone: "+79991234567" },
    });
    expect(corp.text).toContain("Корпоративная заявка");

    const fabric = renderLeadTelegram({
      ...baseLead(),
      input: { type: "fabric-samples", phone: "+79991234567" },
    });
    expect(fabric.text).toContain("образцов тканей");
  });

  it("escapes HTML in user-supplied fields", () => {
    const msg = renderLeadTelegram({
      ...baseLead(),
      input: {
        type: "calculator",
        phone: "+79991234567",
        name: "<script>alert(1)</script>",
        furnitureType: "Диван",
        photoCount: 0,
      },
    });
    expect(msg.text).not.toContain("<script>alert(1)</script>");
    expect(msg.text).toContain("&lt;script&gt;");
  });

  it("includes lead id", () => {
    const lead = {
      ...baseLead(),
      input: { type: "callback", phone: "+79991234567" } as const,
    };
    const msg = renderLeadTelegram(lead);
    expect(msg.text).toContain(lead.id);
  });
});
