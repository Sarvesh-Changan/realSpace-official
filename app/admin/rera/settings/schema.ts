import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), { message: "Must be a valid URL (https://...)" })
  .optional()
  .or(z.literal(""));

const optionalNonNegativeInt = z
  .union([
    z.number().int().nonnegative("Must be a non-negative whole number"),
    z.nan(),
    z.null(),
    z.undefined(),
  ])
  .optional()
  .nullable();

export const reraSettingsSchema = z.object({
  // Business details
  brokerName: z.string().trim().min(1, "Broker / company name is required").max(200),
  tagline: z.string().trim().max(500).optional().or(z.literal("")),
  // RERA registration
  reraRegistrationNo: z.string().trim().max(100).optional().or(z.literal("")),
  reraRegisteredName: z.string().trim().max(200).optional().or(z.literal("")),
  reraVerifyUrl: optionalUrl,
  // Contact details
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  altPhone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Must be a valid email address")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(1000).optional().or(z.literal("")),
  officeHours: z.string().trim().max(200).optional().or(z.literal("")),
  // Social links
  instagram: optionalUrl,
  facebook: optionalUrl,
  youtube: optionalUrl,
  linkedin: optionalUrl,
  // Hero
  heroHeadline: z.string().trim().max(300).optional().or(z.literal("")),
  heroSubhead: z.string().trim().max(1000).optional().or(z.literal("")),
  heroImageUrl: z.string().trim().optional().or(z.literal("")).nullable(),
  heroImagePublicId: z.string().trim().optional().or(z.literal("")).nullable(),
  // Welcome section
  welcomeTitle: z.string().trim().max(300).optional().or(z.literal("")),
  welcomeBody: z.string().trim().max(5000).optional().or(z.literal("")),
  // About / founder
  aboutTitle: z.string().trim().max(300).optional().or(z.literal("")),
  aboutBody: z.string().trim().max(10000).optional().or(z.literal("")),
  founderName: z.string().trim().max(200).optional().or(z.literal("")),
  founderRole: z.string().trim().max(200).optional().or(z.literal("")),
  founderImageUrl: z.string().trim().optional().or(z.literal("")).nullable(),
  founderImagePublicId: z.string().trim().optional().or(z.literal("")).nullable(),
  // Stats
  yearsExperience: optionalNonNegativeInt,
  happyFamilies: optionalNonNegativeInt,
  propertiesClosed: optionalNonNegativeInt,
  // Areas served (stored as comma-separated string in form, converted to array in action)
  areasServedRaw: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ReraSettingsInput = z.infer<typeof reraSettingsSchema>;

