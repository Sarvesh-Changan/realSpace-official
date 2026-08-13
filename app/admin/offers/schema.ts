import { z } from "zod";

export const offerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  ctaLabel: z.string().min(1, "CTA Label is required"),
  ctaLink: z.string().min(1, "CTA Link is required"),
  isActive: z.boolean().default(true),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export type OfferInput = z.infer<typeof offerSchema>;