import { z } from "zod";

export const siteSettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().min(1, "WhatsApp number is required"),
  address: z.string().min(1, "Address is required"),
  heroHeadline: z.string().min(1, "Hero headline is required"),
  heroSubhead: z.string().min(1, "Hero subhead is required"),
  ctaText: z.string().min(1, "CTA text is required"),
  instagram: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  facebook: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  youtube: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  linkedin: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
