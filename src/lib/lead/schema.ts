import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Телефон обязателен")
  .refine(
    (v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length === 11 && digits.startsWith("7");
    },
    { message: "Некорректный номер телефона" }
  );

const nonEmptyTrimmed = z.string().trim().min(1);
const optionalText = z.string().trim().max(2000).optional();

export const LEAD_TYPES = [
  "callback",
  "calculator",
  "corporate",
  "fabric-samples",
] as const;

export type LeadType = (typeof LEAD_TYPES)[number];

const callbackSchema = z.object({
  type: z.literal("callback"),
  phone: phoneSchema,
  source: z.enum(["hero", "contacts"]).optional(),
});

const calculatorSchema = z.object({
  type: z.literal("calculator"),
  phone: phoneSchema,
  name: nonEmptyTrimmed.max(120),
  furnitureType: nonEmptyTrimmed.max(120),
  comment: optionalText,
  photoCount: z.number().int().min(0).max(20).default(0),
});

const corporateSchema = z.object({
  type: z.literal("corporate"),
  phone: phoneSchema,
});

const fabricSchema = z.object({
  type: z.literal("fabric-samples"),
  phone: phoneSchema,
});

export const leadInputSchema = z.discriminatedUnion("type", [
  callbackSchema,
  calculatorSchema,
  corporateSchema,
  fabricSchema,
]);

export type LeadInput = z.infer<typeof leadInputSchema>;

export interface LeadPhotoAttachment {
  filename: string;
  contentType: string;
  size: number;
  buffer: Buffer;
}

export interface Lead extends LeadEnvelope {
  input: LeadInput;
  photos: LeadPhotoAttachment[];
}

interface LeadEnvelope {
  id: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 11) return phone;
  const d = digits.startsWith("8") ? "7" + digits.slice(1) : digits;
  return `+${d[0]} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}
