import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Partner name is required").max(160),
  description: z.string().trim().max(1200).optional().default(""),
  logoUrl: z.string().trim().url("Upload a logo image").max(2000),
  logoPublicId: z.string().trim().max(255).optional().nullable().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(10000),
  isPublished: z.boolean(),
});

export type PartnerInput = z.infer<typeof partnerSchema>;
