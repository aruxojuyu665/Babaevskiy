import { promises as fs } from "fs";
import path from "path";
import type { Lead } from "./schema";

const LEADS_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(LEADS_DIR, "leads.json");

export interface PersistedLead {
  id: string;
  timestamp: string;
  type: Lead["input"]["type"];
  input: Lead["input"];
  photoCount: number;
  ip?: string;
  userAgent?: string;
}

export async function persistLead(lead: Lead): Promise<PersistedLead> {
  const record: PersistedLead = {
    id: lead.id,
    timestamp: lead.timestamp,
    type: lead.input.type,
    input: lead.input,
    photoCount: lead.photos.length,
    ip: lead.ip,
    userAgent: lead.userAgent,
  };

  await fs.mkdir(LEADS_DIR, { recursive: true });

  const existing = await readExisting();
  const next = [...existing, record];
  await fs.writeFile(LEADS_FILE, JSON.stringify(next, null, 2), "utf-8");

  return record;
}

async function readExisting(): Promise<PersistedLead[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PersistedLead[]) : [];
  } catch {
    return [];
  }
}
