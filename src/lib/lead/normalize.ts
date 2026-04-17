import { leadInputSchema, type LeadInput, type LeadPhotoAttachment } from "./schema";

export interface ParsedRequest {
  input: LeadInput;
  photos: LeadPhotoAttachment[];
}

export class LeadValidationError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "LeadValidationError";
  }
}

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB per file
const MAX_TOTAL_PHOTO_BYTES = 24 * 1024 * 1024; // 24 MB total
const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function parseRequest(
  request: Request
): Promise<ParsedRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return parseMultipart(request);
  }

  return parseJson(request);
}

async function parseJson(request: Request): Promise<ParsedRequest> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new LeadValidationError("Некорректный JSON");
  }
  const parsed = leadInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new LeadValidationError(
      firstIssue(parsed.error.issues) ?? "Ошибка валидации",
      parsed.error.issues
    );
  }
  return { input: parsed.data, photos: [] };
}

async function parseMultipart(request: Request): Promise<ParsedRequest> {
  const form = await request.formData();
  const type = (form.get("type") ?? "").toString();

  const photos = await extractPhotos(form);

  const raw: Record<string, unknown> = {
    type,
    phone: stringOrUndefined(form.get("phone")),
    name: stringOrUndefined(form.get("name")),
    furnitureType: stringOrUndefined(form.get("furnitureType")),
    comment: stringOrUndefined(form.get("comment")),
    source: stringOrUndefined(form.get("source")),
    photoCount: photos.length,
  };

  for (const key of Object.keys(raw)) {
    if (raw[key] === undefined) delete raw[key];
  }

  const parsed = leadInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new LeadValidationError(
      firstIssue(parsed.error.issues) ?? "Ошибка валидации",
      parsed.error.issues
    );
  }

  return { input: parsed.data, photos };
}

async function extractPhotos(form: FormData): Promise<LeadPhotoAttachment[]> {
  const entries = form.getAll("photos").filter((v): v is File => v instanceof File && v.size > 0);
  if (entries.length === 0) return [];

  let totalBytes = 0;
  const photos: LeadPhotoAttachment[] = [];
  for (const file of entries.slice(0, 10)) {
    if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
      throw new LeadValidationError(`Неподдерживаемый формат фото: ${file.type || "unknown"}`);
    }
    if (file.size > MAX_PHOTO_BYTES) {
      throw new LeadValidationError(`Фото ${file.name} превышает лимит 8 МБ`);
    }
    totalBytes += file.size;
    if (totalBytes > MAX_TOTAL_PHOTO_BYTES) {
      throw new LeadValidationError("Суммарный размер фото превышает 24 МБ");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    photos.push({
      filename: sanitizeFilename(file.name || "photo.jpg"),
      contentType: file.type,
      size: file.size,
      buffer,
    });
  }
  return photos;
}

function stringOrUndefined(v: FormDataEntryValue | null): string | undefined {
  if (v === null) return undefined;
  const s = typeof v === "string" ? v : "";
  const trimmed = s.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.\-]/g, "_").slice(0, 120);
}

interface Issue {
  message: string;
  path: ReadonlyArray<PropertyKey>;
}

function firstIssue(issues: ReadonlyArray<Issue>): string | undefined {
  if (issues.length === 0) return undefined;
  const issue = issues[0]!;
  const field = issue.path.map(String).join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}
