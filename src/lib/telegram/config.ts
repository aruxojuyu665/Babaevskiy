export interface TelegramConfig {
  token: string;
  chatId: string;
  apiBase: string;
}

export class TelegramConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelegramConfigError";
  }
}

export function loadTelegramConfig(
  env: NodeJS.ProcessEnv = process.env
): TelegramConfig {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();

  const missing: string[] = [];
  if (!token) missing.push("TELEGRAM_BOT_TOKEN");
  if (!chatId) missing.push("TELEGRAM_CHAT_ID");
  if (missing.length > 0) {
    throw new TelegramConfigError(
      `Telegram не сконфигурирован: ${missing.join(", ")}`
    );
  }

  if (!/^\d+:[A-Za-z0-9_-]+$/.test(token!)) {
    throw new TelegramConfigError("TELEGRAM_BOT_TOKEN имеет неверный формат");
  }

  return {
    token: token!,
    chatId: chatId!,
    apiBase: env.TELEGRAM_API_BASE?.trim() || "https://api.telegram.org",
  };
}
