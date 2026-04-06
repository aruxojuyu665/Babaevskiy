import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let leadData: Record<string, string>;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      leadData = {
        name: formData.get("name") as string || "",
        phone: formData.get("phone") as string || "",
        furnitureType: formData.get("furnitureType") as string || "",
        comment: formData.get("comment") as string || "",
        type: formData.get("type") as string || "calculator",
        hasPhotos: String(formData.getAll("photos").length > 0),
      };
    } else {
      leadData = await request.json();
    }

    // Validate phone
    const digits = (leadData.phone || "").replace(/\D/g, "");
    if (digits.length !== 11 || !digits.startsWith("7")) {
      return NextResponse.json(
        { success: false, error: "Некорректный номер телефона" },
        { status: 400 }
      );
    }

    // Save lead to JSON file for future CRM migration
    const lead = {
      ...leadData,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID(),
    };

    const leadsDir = path.join(process.cwd(), "data");
    await fs.mkdir(leadsDir, { recursive: true });

    const leadsFile = path.join(leadsDir, "leads.json");
    let leads: unknown[] = [];
    try {
      const existing = await fs.readFile(leadsFile, "utf-8");
      leads = JSON.parse(existing);
    } catch {
      // File doesn't exist yet
    }

    leads.push(lead);
    await fs.writeFile(leadsFile, JSON.stringify(leads, null, 2), "utf-8");

    // TODO: Send email via Resend when API key is configured
    // const emailTo = process.env.EMAIL_TO;
    // const resendKey = process.env.RESEND_API_KEY;
    // if (emailTo && resendKey) { ... }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
