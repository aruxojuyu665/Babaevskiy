import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";

// Mock nodemailer before importing the route handler.
const sentMails: Array<Record<string, unknown>> = [];
let shouldFail = false;

vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: vi.fn(async (opts: Record<string, unknown>) => {
        if (shouldFail) throw new Error("SMTP offline");
        sentMails.push(opts);
        return {
          messageId: `<test-${sentMails.length}@localhost>`,
          accepted: [String(opts.to)],
          rejected: [],
        };
      }),
    }),
  },
}));

const ENV_BACKUP = { ...process.env };
const LEADS_FILE = path.join(process.cwd(), "data", "leads.json");

beforeEach(async () => {
  sentMails.length = 0;
  shouldFail = false;
  Object.assign(process.env, {
    SMTP_HOST: "smtp.test.local",
    SMTP_PORT: "465",
    SMTP_USER: "sender@test.local",
    SMTP_PASS: "test-pass",
    EMAIL_FROM: "Sender <sender@test.local>",
    EMAIL_TO: "dest@test.local",
  });
  await fs.rm(LEADS_FILE, { force: true });
});

afterEach(async () => {
  // Restore process.env to avoid leaking into other tests.
  for (const k of Object.keys(process.env)) {
    if (!(k in ENV_BACKUP)) delete process.env[k];
  }
  Object.assign(process.env, ENV_BACKUP);
  await fs.rm(LEADS_FILE, { force: true });
});

afterAll(async () => {
  // Clean up data dir if test created it.
  await fs.rm(path.join(process.cwd(), "data"), { recursive: true, force: true });
});

async function importRoute() {
  // Re-import on every call so env changes are picked up by route-level reads.
  const mod = await import("@/app/api/lead/route");
  return mod;
}

function jsonReq(body: unknown): Request {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function multipartReq(form: FormData): Request {
  return new Request("http://localhost/api/lead", { method: "POST", body: form });
}

interface SuccessResponse {
  success: true;
  id: string;
  persisted: boolean;
  emailed: boolean;
}

interface ErrorResponse {
  success: false;
  error: string;
}

describe("POST /api/lead — all form types end to end", () => {
  it("sends callback from hero", async () => {
    const { POST } = await importRoute();
    const res = await POST(jsonReq({ type: "callback", phone: "+79991234567", source: "hero" }) as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponse;
    expect(body.success).toBe(true);
    expect(body.emailed).toBe(true);
    expect(body.persisted).toBe(true);

    expect(sentMails).toHaveLength(1);
    const mail = sentMails[0]!;
    expect(mail.subject).toContain("Заявка на перезвон");
    expect(String(mail.text)).toContain("Главный блок (Hero)");
    expect(String(mail.to)).toBe("dest@test.local");
  });

  it("sends callback from contacts (внизу сайта)", async () => {
    const { POST } = await importRoute();
    const res = await POST(
      jsonReq({ type: "callback", phone: "+79991234567", source: "contacts" }) as never
    );
    expect(res.status).toBe(200);
    expect(sentMails).toHaveLength(1);
    expect(String(sentMails[0]!.text)).toContain("Контакты");
  });

  it("sends calculator (repair) with full data and 2 photos", async () => {
    const form = new FormData();
    form.set("type", "calculator");
    form.set("phone", "+79991234567");
    form.set("name", "Иван Петров");
    form.set("furnitureType", "Диван прямой");
    form.set("comment", "Обивка порвалась на подлокотнике");
    form.append("photos", new File([new Uint8Array([0xff, 0xd8, 0xff])], "a.jpg", { type: "image/jpeg" }));
    form.append("photos", new File([new Uint8Array([0xff, 0xd8, 0xff])], "b.jpg", { type: "image/jpeg" }));

    const { POST } = await importRoute();
    const res = await POST(multipartReq(form) as never);
    expect(res.status).toBe(200);

    expect(sentMails).toHaveLength(1);
    const mail = sentMails[0]!;
    expect(mail.subject).toContain("Заявка на ремонт");
    expect(mail.subject).toContain("Иван Петров");
    expect(mail.subject).toContain("Диван прямой");
    expect(String(mail.text)).toContain("Обивка порвалась");
    expect(mail.attachments).toHaveLength(2);
  });

  it("sends corporate", async () => {
    const { POST } = await importRoute();
    const res = await POST(jsonReq({ type: "corporate", phone: "+79991234567" }) as never);
    expect(res.status).toBe(200);
    expect(sentMails[0]!.subject).toContain("Корпоративная заявка");
  });

  it("sends fabric-samples", async () => {
    const { POST } = await importRoute();
    const res = await POST(jsonReq({ type: "fabric-samples", phone: "+79991234567" }) as never);
    expect(res.status).toBe(200);
    expect(sentMails[0]!.subject).toContain("Запрос образцов тканей");
  });

  it("rejects invalid phone with 400", async () => {
    const { POST } = await importRoute();
    const res = await POST(jsonReq({ type: "callback", phone: "123" }) as never);
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.success).toBe(false);
    expect(sentMails).toHaveLength(0);
  });

  it("persists to leads.json even when SMTP fails", async () => {
    shouldFail = true;
    const { POST } = await importRoute();
    const res = await POST(jsonReq({ type: "callback", phone: "+79991234567" }) as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponse;
    expect(body.persisted).toBe(true);
    expect(body.emailed).toBe(false);

    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    const leads = JSON.parse(raw);
    expect(Array.isArray(leads)).toBe(true);
    expect(leads).toHaveLength(1);
    expect(leads[0].type).toBe("callback");
  });
});
