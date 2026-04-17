import { describe, expect, it } from "vitest";
import { renderLeadEmail } from "./templates";
import type { Lead } from "../lead/schema";

function baseLead(): Pick<Lead, "id" | "timestamp" | "photos"> {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    timestamp: "2026-04-17T10:00:00.000Z",
    photos: [],
  };
}

describe("renderLeadEmail", () => {
  it("renders callback subject with phone", () => {
    const content = renderLeadEmail({
      ...baseLead(),
      input: { type: "callback", phone: "+79991234567", source: "hero" },
    });
    expect(content.subject).toContain("Заявка на перезвон");
    expect(content.subject).toContain("+7 (999) 123-45-67");
    expect(content.text).toContain("Главный блок (Hero)");
    expect(content.html).toContain("Заявка на перезвон");
  });

  it("renders contacts source as bottom block", () => {
    const content = renderLeadEmail({
      ...baseLead(),
      input: { type: "callback", phone: "+79991234567", source: "contacts" },
    });
    expect(content.text).toContain("Контакты");
  });

  it("renders calculator with name and furniture type", () => {
    const content = renderLeadEmail({
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
    expect(content.subject).toContain("Заявка на ремонт");
    expect(content.subject).toContain("Иван");
    expect(content.subject).toContain("Диван прямой");
    expect(content.text).toContain("Порвалась обивка");
    expect(content.text).toContain("2 шт. (во вложении)");
  });

  it("shows dash for empty comment", () => {
    const content = renderLeadEmail({
      ...baseLead(),
      input: {
        type: "calculator",
        phone: "+79991234567",
        name: "Иван",
        furnitureType: "Кресло",
        photoCount: 0,
      },
    });
    expect(content.text).toContain("Комментарий: —");
    expect(content.text).toContain("Фото: нет");
  });

  it("renders corporate subject", () => {
    const content = renderLeadEmail({
      ...baseLead(),
      input: { type: "corporate", phone: "+79991234567" },
    });
    expect(content.subject).toContain("Корпоративная заявка");
  });

  it("renders fabric-samples subject", () => {
    const content = renderLeadEmail({
      ...baseLead(),
      input: { type: "fabric-samples", phone: "+79991234567" },
    });
    expect(content.subject).toContain("Запрос образцов тканей");
  });

  it("escapes HTML in user-supplied fields", () => {
    const content = renderLeadEmail({
      ...baseLead(),
      input: {
        type: "calculator",
        phone: "+79991234567",
        name: "<script>alert(1)</script>",
        furnitureType: "Диван",
        photoCount: 0,
      },
    });
    expect(content.html).not.toContain("<script>alert(1)</script>");
    expect(content.html).toContain("&lt;script&gt;");
  });

  it("includes lead ID in email body", () => {
    const lead = {
      ...baseLead(),
      input: { type: "callback", phone: "+79991234567" } as const,
    };
    const content = renderLeadEmail(lead);
    expect(content.text).toContain(lead.id);
  });
});
