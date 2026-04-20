import { describe, expect, it } from "vitest";
import { evaluateAntiBot, MIN_FORM_FILL_MS } from "./anti-bot";
import { checkRateLimit, __resetRateLimiter } from "./rate-limit";

describe("evaluateAntiBot", () => {
  it("passes clean submission with plausible timing", () => {
    const v = evaluateAntiBot({ honeypot: "", ts: Date.now() - (MIN_FORM_FILL_MS + 500) });
    expect(v.bot).toBe(false);
  });

  it("flags filled honeypot as bot", () => {
    const v = evaluateAntiBot({ honeypot: "https://spam.example", ts: Date.now() - 10_000 });
    expect(v.bot).toBe(true);
    expect(v.reason).toBe("honeypot");
  });

  it("flags sub-threshold submission as too-fast", () => {
    const v = evaluateAntiBot({ honeypot: "", ts: Date.now() - 200 });
    expect(v.bot).toBe(true);
    expect(v.reason).toBe("too-fast");
  });

  it("passes when timing signal absent (server-to-server integrations)", () => {
    const v = evaluateAntiBot({});
    expect(v.bot).toBe(false);
  });

  it("tolerates clock skew (negative age)", () => {
    const v = evaluateAntiBot({ ts: Date.now() + 5_000 });
    expect(v.bot).toBe(false);
  });
});

describe("checkRateLimit", () => {
  it("allows the first 5 requests from same IP, blocks the 6th", () => {
    __resetRateLimiter();
    const ip = "203.0.113.5";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip).allowed).toBe(true);
    }
    const sixth = checkRateLimit(ip);
    expect(sixth.allowed).toBe(false);
    expect(sixth.retryAfterSec).toBeGreaterThan(0);
  });

  it("isolates limits per IP", () => {
    __resetRateLimiter();
    for (let i = 0; i < 5; i++) checkRateLimit("1.1.1.1");
    expect(checkRateLimit("1.1.1.1").allowed).toBe(false);
    expect(checkRateLimit("2.2.2.2").allowed).toBe(true);
  });

  it("allows requests when IP is unknown (no block)", () => {
    __resetRateLimiter();
    expect(checkRateLimit(undefined).allowed).toBe(true);
  });
});
