import { z } from 'zod';

export const reraPropertyAmenityImageSchema = z.object({
  amenity: z.string().trim().min(1).max(100),
  url: z.string().trim().min(1),
  publicId: z.string().trim().nullable().optional(),
});

export const reraPropertyAmenityImagesSchema = z.array(reraPropertyAmenityImageSchema);
export type ReraPropertyAmenityImageInput = z.infer<typeof reraPropertyAmenityImageSchema>;

export function parseReraPropertyAmenityImages(value: unknown): ReraPropertyAmenityImageInput[] {
  const parsed = reraPropertyAmenityImagesSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}
