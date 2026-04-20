import { NextResponse, type NextRequest } from "next/server";
import { parseRequest, LeadValidationError } from "@/lib/lead/normalize";
import { persistLead } from "@/lib/lead/persist";
import type { Lead } from "@/lib/lead/schema";
import { sendLeadEmail } from "@/lib/email/send";
import { EmailConfigError } from "@/lib/email/transport";
import { sendLeadTelegram } from "@/lib/telegram/send";
import { TelegramConfigError } from "@/lib/telegram/config";
import { evaluateAntiBot } from "@/lib/lead/anti-bot";
import { checkRateLimit } from "@/lib/lead/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);

    // Rate limit check runs BEFORE body parsing so a flood of garbage payloads
    // can't exhaust CPU/memory parsing JSON or multipart attachments.
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Слишком много заявок. Попробуйте через несколько минут." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        }
      );
    }

    const parsed = await parseRequest(request);

    // Silent drop for detected bots — return 200 OK with a fake id so the bot
    // gets no signal to iterate against. Nothing is saved or forwarded.
    const verdict = evaluateAntiBot(parsed.antiBot);
    if (verdict.bot) {
      console.warn("[lead] bot blocked:", verdict.reason, "ip=", ip);
      return NextResponse.json({ success: true, id: crypto.randomUUID() });
    }

    const lead: Lead = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
      input: parsed.input,
      photos: parsed.photos,
    };

    let persistError: unknown = null;
    try {
      await persistLead(lead);
    } catch (e) {
      persistError = e;
      console.error("[lead] persist failed", e);
    }

    // Email and Telegram run fully in parallel. Neither blocks the other, and
    // a failure in one must not prevent the other from being attempted.
    const [emailOutcome, telegramOutcome] = await Promise.allSettled([
      sendLeadEmail(lead),
      sendLeadTelegram(lead),
    ]);

    const emailError =
      emailOutcome.status === "rejected" ? emailOutcome.reason : null;
    const telegramError =
      telegramOutcome.status === "rejected" ? telegramOutcome.reason : null;

    if (emailError) console.error("[lead] email failed", emailError);
    if (telegramError) {
      if (telegramError instanceof TelegramConfigError) {
        console.warn("[lead] telegram disabled:", telegramError.message);
      } else {
        console.error("[lead] telegram failed", telegramError);
      }
    }

    // Lead is considered received if ANY sink succeeded.
    const anySuccess =
      !persistError ||
      emailOutcome.status === "fulfilled" ||
      telegramOutcome.status === "fulfilled";

    if (!anySuccess) {
      const message =
        emailError instanceof EmailConfigError
          ? emailError.message
          : "Не удалось сохранить заявку. Свяжитесь с нами по телефону.";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: lead.id,
      persisted: !persistError,
      emailed: emailOutcome.status === "fulfilled",
      telegram: telegramOutcome.status === "fulfilled",
    });
  } catch (error: unknown) {
    if (error instanceof LeadValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[lead] route error", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function clientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? undefined;
}
