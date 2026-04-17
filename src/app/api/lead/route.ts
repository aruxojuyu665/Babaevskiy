import { NextResponse, type NextRequest } from "next/server";
import { parseRequest, LeadValidationError } from "@/lib/lead/normalize";
import { persistLead } from "@/lib/lead/persist";
import type { Lead } from "@/lib/lead/schema";
import { sendLeadEmail } from "@/lib/email/send";
import { EmailConfigError } from "@/lib/email/transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseRequest(request);

    const lead: Lead = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ip: clientIp(request),
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

    let emailError: unknown = null;
    try {
      await sendLeadEmail(lead);
    } catch (e) {
      emailError = e;
      console.error("[lead] email failed", e);
    }

    // Lead is considered received if ANY sink succeeded.
    if (persistError && emailError) {
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
      emailed: !emailError,
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
