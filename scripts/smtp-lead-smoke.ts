import { promises as fs } from "fs";
import path from "path";
import { sendLeadEmail } from "@/lib/email/send";
import { loadSmtpConfig } from "@/lib/email/transport";
import type { Lead } from "@/lib/lead/schema";

async function loadEnvLocal(): Promise<void> {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const raw = await fs.readFile(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // no .env.local — fall back to already-exported env
  }
}

function nowId(suffix: string): string {
  return `smoke-${Date.now()}-${suffix}`;
}

function base(suffix: string): Pick<Lead, "id" | "timestamp" | "photos"> {
  return {
    id: nowId(suffix),
    timestamp: new Date().toISOString(),
    photos: [],
  };
}

async function main(): Promise<void> {
  await loadEnvLocal();
  const config = loadSmtpConfig();
  console.log(`SMTP: ${config.host}:${config.port} user=${config.user}`);
  console.log(`FROM: ${config.from}`);
  console.log(`TO:   ${config.to}`);

  const phone = process.env.SMTP_TEST_PHONE ?? "+79991234567";

  const fakePng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x5b, 0x6e, 0x2f, 0x9b, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  const leads: Lead[] = [
    {
      ...base("callback-hero"),
      input: { type: "callback", phone, source: "hero" },
    },
    {
      ...base("callback-contacts"),
      input: { type: "callback", phone, source: "contacts" },
    },
    {
      ...base("calculator"),
      input: {
        type: "calculator",
        phone,
        name: "SMOKE Иван Петров",
        furnitureType: "Диван прямой (тест)",
        comment: "Это тестовая заявка — проверяем, что письмо с фото доходит.",
        photoCount: 1,
      },
      photos: [
        { filename: "smoke.png", contentType: "image/png", size: fakePng.length, buffer: fakePng },
      ],
    },
    {
      ...base("corporate"),
      input: { type: "corporate", phone },
    },
    {
      ...base("fabric-samples"),
      input: { type: "fabric-samples", phone },
    },
  ];

  let ok = 0;
  let failed = 0;
  for (const lead of leads) {
    const label = `${lead.input.type}${"source" in lead.input ? `:${lead.input.source ?? "-"}` : ""}`;
    process.stdout.write(`→ sending ${label.padEnd(24)} `);
    try {
      const result = await sendLeadEmail(lead, config);
      console.log(`OK messageId=${result.messageId} accepted=${result.accepted.join(",")}`);
      ok += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`FAIL ${msg}`);
      failed += 1;
    }
  }

  console.log(`\nResult: ${ok} sent, ${failed} failed, ${leads.length} total`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
