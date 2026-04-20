/* Verifies that email and telegram sinks are truly parallel and independent:
 *  - both are attempted regardless of order
 *  - failure of one does not prevent the other
 *  - both started before either finished (overlap proves parallelism)
 */
import { describe, expect, it, vi } from "vitest";

describe("lead route: email + telegram parallel isolation", () => {
  it("runs both sinks in parallel; one failing does not block the other", async () => {
    vi.resetModules();
    const timeline: Array<{ t: number; event: string }> = [];
    const t0 = Date.now();
    const mark = (event: string) => timeline.push({ t: Date.now() - t0, event });

    vi.doMock("@/lib/lead/persist", () => ({
      persistLead: vi.fn(async () => {
        mark("persist:done");
      }),
    }));
    vi.doMock("@/lib/email/send", () => ({
      sendLeadEmail: vi.fn(async () => {
        mark("email:start");
        await new Promise((r) => setTimeout(r, 80));
        mark("email:done");
        return { messageId: "m1", accepted: ["to@x"], rejected: [] };
      }),
    }));
    vi.doMock("@/lib/telegram/send", () => ({
      sendLeadTelegram: vi.fn(async () => {
        mark("telegram:start");
        await new Promise((r) => setTimeout(r, 40));
        mark("telegram:fail");
        throw new Error("Telegram 500");
      }),
    }));

    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "corporate", phone: "+79991234567" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      persisted: true,
      emailed: true,
      telegram: false,
    });

    const emailStart = timeline.find((e) => e.event === "email:start")!.t;
    const telegramStart = timeline.find((e) => e.event === "telegram:start")!.t;
    const telegramFail = timeline.find((e) => e.event === "telegram:fail")!.t;
    const emailDone = timeline.find((e) => e.event === "email:done")!.t;

    // Both sinks must have started within a few ms of each other (Promise.all).
    expect(Math.abs(emailStart - telegramStart)).toBeLessThan(15);
    // Telegram must have failed while email was still in flight.
    expect(telegramFail).toBeLessThan(emailDone);
  });

  it("still returns success when telegram succeeds but email fails", async () => {
    vi.resetModules();
    vi.doMock("@/lib/lead/persist", () => ({
      persistLead: vi.fn(async () => {
        throw new Error("disk full");
      }),
    }));
    vi.doMock("@/lib/email/send", () => ({
      sendLeadEmail: vi.fn(async () => {
        throw new Error("SMTP down");
      }),
    }));
    vi.doMock("@/lib/telegram/send", () => ({
      sendLeadTelegram: vi.fn(async () => ({ messageIds: [1], chatId: "-100" })),
    }));

    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "corporate", phone: "+79991234567" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      persisted: false,
      emailed: false,
      telegram: true,
    });
  });
});
