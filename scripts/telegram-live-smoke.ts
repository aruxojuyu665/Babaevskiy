/* Live integration smoke for the Telegram notification path.
 * Reads creds from .env.local, builds 4 fake leads (callback / calculator with
 * photos / corporate / fabric-samples) and sends each to the real channel.
 * Usage: npx tsx scripts/telegram-live-smoke.ts
 */
import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sendLeadTelegram } from "../src/lib/telegram/send";
import type { Lead } from "../src/lib/lead/schema";

loadEnvConfig(process.cwd());

function lead(id: string, input: Lead["input"], photos: Lead["photos"] = []): Lead {
  return {
    id,
    timestamp: new Date().toISOString(),
    ip: "127.0.0.1",
    userAgent: "telegram-smoke/1.0",
    input,
    photos,
  };
}

const PHOTO_A = readFileSync(resolve(process.cwd(), "public/frames/frame-001.jpg"));
const PHOTO_B = readFileSync(resolve(process.cwd(), "public/frames/frame-002.jpg"));

async function main() {
  const leads: Array<{ label: string; lead: Lead }> = [
    {
      label: "callback/hero",
      lead: lead("smoke-callback-1", { type: "callback", phone: "+79991234567", source: "hero" }),
    },
    {
      label: "calculator + 2 photos",
      lead: lead(
        "smoke-calc-1",
        {
          type: "calculator",
          phone: "+79995551122",
          name: "Smoke Тестович",
          furnitureType: "Диван угловой",
          comment: "Порвалась обивка на подлокотнике",
          photoCount: 2,
        },
        [
          { filename: "a.jpg", contentType: "image/jpeg", size: PHOTO_A.length, buffer: PHOTO_A },
          { filename: "b.jpg", contentType: "image/jpeg", size: PHOTO_B.length, buffer: PHOTO_B },
        ]
      ),
    },
    {
      label: "corporate",
      lead: lead("smoke-corp-1", { type: "corporate", phone: "+79990001122" }),
    },
    {
      label: "fabric-samples",
      lead: lead("smoke-fab-1", { type: "fabric-samples", phone: "+79993334455" }),
    },
  ];

  for (const { label, lead: l } of leads) {
    try {
      const res = await sendLeadTelegram(l);
      console.log(`[OK]  ${label}  →  message_ids=${res.messageIds.join(",")}`);
    } catch (err) {
      console.error(`[ERR] ${label}  →  ${(err as Error).message}`);
      process.exitCode = 1;
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
