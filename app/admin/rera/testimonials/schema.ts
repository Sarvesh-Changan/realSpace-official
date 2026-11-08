import { z } from "zod";

export const reraTestimonialSchema = z.object({
  id: z.string().optional(),
  authorName: z.string().trim().min(1, "Author name is required").max(150),
  authorRole: z.string().trim().max(100).optional().or(z.literal("")),
  society: z.string().trim().max(200).optional().or(z.literal("")),
  quote: z.string().trim().min(1, "Testimonial quote is required").max(5000),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export type ReraTestimonialInput = z.infer<typeof reraTestimonialSchema>;

