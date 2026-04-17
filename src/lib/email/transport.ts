import nodemailer, { type Transporter } from "nodemailer";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
}

export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigError";
  }
}

export function loadSmtpConfig(env: NodeJS.ProcessEnv = process.env): SmtpConfig {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM", "EMAIL_TO"] as const;
  const missing = required.filter((k) => !env[k] || env[k]?.trim() === "");
  if (missing.length > 0) {
    throw new EmailConfigError(`SMTP не сконфигурирован: ${missing.join(", ")}`);
  }
  const port = Number(env.SMTP_PORT);
  if (!Number.isFinite(port) || port <= 0) {
    throw new EmailConfigError(`SMTP_PORT некорректен: ${env.SMTP_PORT}`);
  }
  return {
    host: env.SMTP_HOST!.trim(),
    port,
    user: env.SMTP_USER!.trim(),
    pass: env.SMTP_PASS!.replace(/\s+/g, ""),
    from: env.EMAIL_FROM!.trim(),
    to: env.EMAIL_TO!.trim(),
  };
}

let cached: Transporter | null = null;
let cachedKey: string | null = null;

export function getTransport(config: SmtpConfig): Transporter {
  const key = `${config.host}:${config.port}:${config.user}`;
  if (cached && cachedKey === key) return cached;
  cached = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });
  cachedKey = key;
  return cached;
}

export function resetTransportCache(): void {
  cached = null;
  cachedKey = null;
}
