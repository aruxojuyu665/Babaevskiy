/**
 * Server-side bot heuristics for lead submissions.
 *
 * Two signals are checked:
 *  - honeypot: a hidden input (`website`) that real users never fill in.
 *  - timing: minimum fill time — forms submitted faster than a human possibly
 *    could are bot automation.
 *
 * Both are silent: a detected bot receives a fake `200 OK` success response so
 * the bot has no feedback loop to iterate against. Nothing is persisted or sent.
 */

export const ANTI_BOT_HONEYPOT_FIELD = "website" as const;
export const ANTI_BOT_TS_FIELD = "_ts" as const;

// A human needs at least this long to read, tab, type, and submit.
// 2.5s is empirically safe — most real users take 5-30s even on a one-field form.
export const MIN_FORM_FILL_MS = 2500;

// Ignore stale timestamps (tab left open for days). Over this threshold we
// treat `_ts` as missing rather than as "extremely slow but valid".
const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 6; // 6 hours

export interface AntiBotSignals {
  honeypot?: string;
  ts?: number;
}

export interface AntiBotVerdict {
  bot: boolean;
  reason?: "honeypot" | "too-fast";
}

export function evaluateAntiBot(signals: AntiBotSignals): AntiBotVerdict {
  if (signals.honeypot && signals.honeypot.trim().length > 0) {
    return { bot: true, reason: "honeypot" };
  }

  const ts = signals.ts;
  if (typeof ts === "number" && Number.isFinite(ts)) {
    const age = Date.now() - ts;
    if (age >= 0 && age < MIN_FORM_FILL_MS) {
      return { bot: true, reason: "too-fast" };
    }
    // age < 0 → clock skew; age > MAX_FORM_AGE_MS → probably replayed, fall through
    // and let rate limiting / normal validation handle it.
    if (age > MAX_FORM_AGE_MS) {
      // Don't flag — just treat as missing.
    }
  }

  return { bot: false };
}

export function parseTimestamp(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim().length > 0) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export function parseHoneypot(raw: unknown): string | undefined {
  if (typeof raw === "string") return raw;
  return undefined;
}
