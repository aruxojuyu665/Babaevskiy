import { describe, expect, it } from "vitest";
import { leadInputSchema, normalizePhone } from "./schema";

describe("leadInputSchema", () => {
  it("accepts callback with valid russian phone", () => {
    const parsed = leadInputSchema.parse({ type: "callback", phone: "+7 (999) 123-45-67" });
    expect(parsed.type).toBe("callback");
  });

  it("accepts callback with source", () => {
    const parsed = leadInputSchema.parse({
      type: "callback",
      phone: "+79991234567",
      source: "hero",
    });
    expect(parsed).toMatchObject({ type: "callback", source: "hero" });
  });

  it("rejects callback with short phone", () => {
    const result = leadInputSchema.safeParse({ type: "callback", phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects callback with phone not starting with 7", () => {
    const result = leadInputSchema.safeParse({ type: "callback", phone: "+1 999 123 45 67" });
    expect(result.success).toBe(false);
  });

  it("accepts calculator with all required fields", () => {
    const parsed = leadInputSchema.parse({
      type: "calculator",
      phone: "+79991234567",
      name: "Иван",
      furnitureType: "Диван прямой",
      comment: "Порвалась обивка",
      photoCount: 2,
    });
    expect(parsed).toMatchObject({ type: "calculator", photoCount: 2 });
  });

  it("defaults photoCount to 0 for calculator", () => {
    const parsed = leadInputSchema.parse({
      type: "calculator",
      phone: "+79991234567",
      name: "Иван",
      furnitureType: "Диван прямой",
    });
    if (parsed.type !== "calculator") throw new Error("wrong type");
    expect(parsed.photoCount).toBe(0);
  });

  it("rejects calculator without name", () => {
    const result = leadInputSchema.safeParse({
      type: "calculator",
      phone: "+79991234567",
      furnitureType: "Кресло",
    });
    expect(result.success).toBe(false);
  });

  it("rejects calculator with empty furnitureType", () => {
    const result = leadInputSchema.safeParse({
      type: "calculator",
      phone: "+79991234567",
      name: "Иван",
      furnitureType: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("accepts corporate", () => {
    const parsed = leadInputSchema.parse({ type: "corporate", phone: "+79991234567" });
    expect(parsed.type).toBe("corporate");
  });

  it("accepts fabric-samples", () => {
    const parsed = leadInputSchema.parse({ type: "fabric-samples", phone: "+79991234567" });
    expect(parsed.type).toBe("fabric-samples");
  });

  it("rejects unknown type", () => {
    const result = leadInputSchema.safeParse({ type: "unknown", phone: "+79991234567" });
    expect(result.success).toBe(false);
  });
});

describe("normalizePhone", () => {
  it("formats 11 digits starting with 7", () => {
    expect(normalizePhone("79991234567")).toBe("+7 (999) 123-45-67");
  });

  it("converts leading 8 to 7", () => {
    expect(normalizePhone("89991234567")).toBe("+7 (999) 123-45-67");
  });

  it("formats from messy input with spaces and dashes", () => {
    expect(normalizePhone("+7 (999) 123-45-67")).toBe("+7 (999) 123-45-67");
  });

  it("returns original if not 11 digits", () => {
    expect(normalizePhone("12345")).toBe("12345");
  });
});
