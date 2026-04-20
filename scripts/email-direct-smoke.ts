import { loadEnvConfig } from "@next/env";
import { sendLeadEmail } from "../src/lib/email/send";
import type { Lead } from "../src/lib/lead/schema";

loadEnvConfig(process.cwd());

const lead: Lead = {
  id: "direct-smoke-email",
  timestamp: new Date().toISOString(),
  ip: "127.0.0.1",
  userAgent: "direct-smoke/1.0",
  input: { type: "callback", phone: "+79991230001", source: "hero" },
  photos: [],
};

const t0 = Date.now();
sendLeadEmail(lead).then(
  (r) => console.log(`[OK] ${Date.now() - t0}ms  messageId=${r.messageId}`),
  (e) => {
    console.log(`[ERR] ${Date.now() - t0}ms  ${(e as Error).message}`);
    process.exit(1);
  }
);
setTimeout(() => {
  console.log(`[TIMEOUT] ${Date.now() - t0}ms script still running`);
  process.exit(2);
}, 30_000).unref?.();
