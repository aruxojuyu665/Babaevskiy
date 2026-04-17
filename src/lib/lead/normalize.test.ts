import { describe, expect, it } from "vitest";
import { parseRequest, LeadValidationError } from "./normalize";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function formRequest(form: FormData): Request {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    body: form,
  });
}

describe("parseRequest — JSON", () => {
  it("parses callback payload", async () => {
    const parsed = await parseRequest(jsonRequest({ type: "callback", phone: "+79991234567" }));
    expect(parsed.input).toMatchObject({ type: "callback", phone: "+79991234567" });
    expect(parsed.photos).toEqual([]);
  });

  it("parses corporate payload", async () => {
    const parsed = await parseRequest(jsonRequest({ type: "corporate", phone: "+79991234567" }));
    expect(parsed.input.type).toBe("corporate");
  });

  it("throws validation error on bad JSON", async () => {
    const bad = new Request("http://localhost/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    });
    await expect(parseRequest(bad)).rejects.toBeInstanceOf(LeadValidationError);
  });

  it("throws validation error on invalid phone", async () => {
    await expect(parseRequest(jsonRequest({ type: "callback", phone: "123" }))).rejects.toBeInstanceOf(
      LeadValidationError
    );
  });
});

describe("parseRequest — multipart", () => {
  it("parses calculator form without photos", async () => {
    const form = new FormData();
    form.set("type", "calculator");
    form.set("phone", "+79991234567");
    form.set("name", "Иван");
    form.set("furnitureType", "Диван прямой");
    form.set("comment", "Порвалась обивка");

    const parsed = await parseRequest(formRequest(form));
    expect(parsed.input).toMatchObject({
      type: "calculator",
      name: "Иван",
      furnitureType: "Диван прямой",
      comment: "Порвалась обивка",
      photoCount: 0,
    });
    expect(parsed.photos).toEqual([]);
  });

  it("parses calculator form with photos", async () => {
    const form = new FormData();
    form.set("type", "calculator");
    form.set("phone", "+79991234567");
    form.set("name", "Иван");
    form.set("furnitureType", "Кресло");
    const fake = new File([new Uint8Array([0xff, 0xd8, 0xff])], "photo.jpg", { type: "image/jpeg" });
    form.append("photos", fake);

    const parsed = await parseRequest(formRequest(form));
    if (parsed.input.type !== "calculator") throw new Error("wrong type");
    expect(parsed.input.photoCount).toBe(1);
    expect(parsed.photos).toHaveLength(1);
    expect(parsed.photos[0]!.filename).toBe("photo.jpg");
    expect(parsed.photos[0]!.contentType).toBe("image/jpeg");
  });

  it("rejects disallowed photo types", async () => {
    const form = new FormData();
    form.set("type", "calculator");
    form.set("phone", "+79991234567");
    form.set("name", "Иван");
    form.set("furnitureType", "Кресло");
    const bad = new File([new Uint8Array([0])], "virus.exe", { type: "application/x-msdownload" });
    form.append("photos", bad);

    await expect(parseRequest(formRequest(form))).rejects.toBeInstanceOf(LeadValidationError);
  });

  it("rejects calculator multipart missing furnitureType", async () => {
    const form = new FormData();
    form.set("type", "calculator");
    form.set("phone", "+79991234567");
    form.set("name", "Иван");

    await expect(parseRequest(formRequest(form))).rejects.toBeInstanceOf(LeadValidationError);
  });
});
