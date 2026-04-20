import { loadEnvConfig } from "@next/env";
import nodemailer from "nodemailer";

loadEnvConfig(process.cwd());

const t0 = Date.now();
const tr = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!.replace(/\s+/g, ""),
  },
  connectionTimeout: 8_000,
  greetingTimeout: 8_000,
  socketTimeout: 12_000,
  logger: true,
  debug: true,
});

tr.verify().then(
  () => { console.log("verify OK in", Date.now() - t0, "ms"); process.exit(0); },
  (e) => { console.log("verify ERR in", Date.now() - t0, "ms:", (e as Error).message); process.exit(1); }
);
