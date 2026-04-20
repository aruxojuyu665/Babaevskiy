import { describe, expect, it } from "vitest";
import { loadTelegramConfig, TelegramConfigError } from "./config";

const fullEnv = {
  TELEGRAM_BOT_TOKEN: "8316574746:AAGbBNnf9W4Ua50yDJ9xr5eMmJegOZZms1E",
  TELEGRAM_CHAT_ID: "-1001234567890",
} as unknown as NodeJS.ProcessEnv;

describe("loadTelegramConfig", () => {
  it("parses full env with defaults", () => {
    const config = loadTelegramConfig(fullEnv);
    expect(config).toEqual({
      token: "8316574746:AAGbBNnf9W4Ua50yDJ9xr5eMmJegOZZms1E",
      chatId: "-1001234567890",
      apiBase: "https://api.telegram.org",
    });
  });

  it("allows overriding api base for tests", () => {
    const config = loadTelegramConfig({
      ...fullEnv,
      TELEGRAM_API_BASE: "http://localhost:9999",
    } as unknown as NodeJS.ProcessEnv);
    expect(config.apiBase).toBe("http://localhost:9999");
  });

  it("throws when TELEGRAM_BOT_TOKEN missing", () => {
    const env = { ...fullEnv, TELEGRAM_BOT_TOKEN: "" } as unknown as NodeJS.ProcessEnv;
    expect(() => loadTelegramConfig(env)).toThrow(TelegramConfigError);
  });

  it("throws when TELEGRAM_CHAT_ID missing", () => {
    const env = { ...fullEnv, TELEGRAM_CHAT_ID: "   " } as unknown as NodeJS.ProcessEnv;
    expect(() => loadTelegramConfig(env)).toThrow(TelegramConfigError);
  });

  it("throws when token format is invalid", () => {
    const env = {
      ...fullEnv,
      TELEGRAM_BOT_TOKEN: "not-a-token",
    } as unknown as NodeJS.ProcessEnv;
    expect(() => loadTelegramConfig(env)).toThrow(/формат/);
  });
});
