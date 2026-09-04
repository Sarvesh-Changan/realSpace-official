import { z } from "zod";

const imagePathOrUrl = z
  .string()
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith("/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid URL or a site-relative path starting with /" }
  )
  .optional()
  .nullable();

export const offerSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: imagePathOrUrl,
  imagePublicId: z.string().optional().nullable(),
  ctaLabel: z.string().min(1, "CTA Label is required"),
  ctaLink: z.string().min(1, "CTA Link is required"),
  isActive: z.boolean().default(true),
  showOnHome: z.boolean().default(false).optional().nullable(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export type OfferInput = z.infer<typeof offerSchema>;