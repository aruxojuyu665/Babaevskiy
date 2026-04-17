import type { Lead } from "../lead/schema";
import { renderLeadEmail } from "./templates";
import { getTransport, loadSmtpConfig, type SmtpConfig } from "./transport";

export interface SendResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

export async function sendLeadEmail(
  lead: Lead,
  config: SmtpConfig = loadSmtpConfig()
): Promise<SendResult> {
  const transport = getTransport(config);
  const content = renderLeadEmail(lead);

  const attachments = lead.photos.map((p) => ({
    filename: p.filename,
    content: p.buffer,
    contentType: p.contentType,
  }));

  const info = await transport.sendMail({
    from: config.from,
    to: config.to,
    subject: content.subject,
    text: content.text,
    html: content.html,
    replyTo: config.from,
    attachments,
    headers: { "X-Lead-Id": lead.id, "X-Lead-Type": lead.input.type },
  });

  return {
    messageId: String(info.messageId),
    accepted: info.accepted.map(String),
    rejected: info.rejected.map(String),
  };
}
