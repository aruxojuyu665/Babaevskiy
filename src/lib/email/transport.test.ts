import { describe, expect, it } from "vitest";
import { loadSmtpConfig, EmailConfigError } from "./transport";

const fullEnv = {
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "465",
  SMTP_USER: "sender@gmail.com",
  SMTP_PASS: "kcds swqb zqwp onvw",
  EMAIL_FROM: "Sender <sender@gmail.com>",
  EMAIL_TO: "dest@gmail.com",
} as unknown as NodeJS.ProcessEnv;

describe("loadSmtpConfig", () => {
  it("parses full env", () => {
    const config = loadSmtpConfig(fullEnv);
    expect(config).toMatchObject({
      host: "smtp.gmail.com",
      port: 465,
      user: "sender@gmail.com",
      from: "Sender <sender@gmail.com>",
      to: "dest@gmail.com",
    });
  });

  it("strips spaces from app password", () => {
    const config = loadSmtpConfig(fullEnv);
    expect(config.pass).toBe("kcdsswqbzqwponvw");
  });

  it("throws when SMTP_USER missing", () => {
    const env = { ...fullEnv, SMTP_USER: "" } as unknown as NodeJS.ProcessEnv;
    expect(() => loadSmtpConfig(env)).toThrow(EmailConfigError);
  });

  it("throws when SMTP_PORT is not a number", () => {
    const env = { ...fullEnv, SMTP_PORT: "abc" } as unknown as NodeJS.ProcessEnv;
    expect(() => loadSmtpConfig(env)).toThrow(EmailConfigError);
  });

  it("throws when EMAIL_TO missing", () => {
    const env = { ...fullEnv, EMAIL_TO: "   " } as unknown as NodeJS.ProcessEnv;
    expect(() => loadSmtpConfig(env)).toThrow(EmailConfigError);
  });
});
