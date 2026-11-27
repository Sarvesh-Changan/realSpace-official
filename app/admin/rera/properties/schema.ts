import { z } from "zod";
import { reraPropertyAmenityImagesSchema } from "@/lib/rera/property-amenity-images";
export { parseReraPropertyAmenityImages } from "@/lib/rera/property-amenity-images";
export type { ReraPropertyAmenityImageInput } from "@/lib/rera/property-amenity-images";

export const reraPropertyCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(40, "Name must be 40 characters or fewer"),
  slug: z.string().trim().min(1, "Slug is required").max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export type ReraPropertyCategoryInput = z.infer<typeof reraPropertyCategorySchema>;

export const reraPropertyImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1, "Image/Video URL is required"),
  publicId: z.string().nullable().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  altText: z.string().trim(),
  sortOrder: z.number().int(),
});

export const reraPropertySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required").max(250, "Title is too long"),
  tagline: z.string().trim().max(160, "Tagline must be 160 characters or fewer").optional().or(z.literal("")),
  slug: z.string().trim().max(250).optional().or(z.literal("")),
  categoryId: z.string().trim().min(1, "Category is required"),
  listingType: z.enum(["SALE", "RENT"]),
  bhkLabel: z.string().trim().max(50).optional().or(z.literal("")),
  locality: z.string().trim().min(1, "Locality is required").max(150),
  city: z.string().trim().max(100),
  projectName: z.string().trim().max(200).optional().or(z.literal("")),
  builderName: z.string().trim().max(200).optional().or(z.literal("")),
  projectReraNo: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().max(10000).optional().or(z.literal("")),
  coverImageUrl: z.string().trim().nullable().optional().or(z.literal("")),
  coverImagePublicId: z.string().trim().nullable().optional().or(z.literal("")),
  brochureUrl: z.string().trim().nullable().optional().or(z.literal("")),
  brochurePublicId: z.string().trim().nullable().optional().or(z.literal("")),
  isFeatured: z.boolean(),
  isNewLaunch: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: z.number().int(),
  amenities: z.array(z.string().trim()),
  amenityImages: reraPropertyAmenityImagesSchema,
  // Property detail pages use a single cover image. Legacy gallery records are
  // cleaned up when a property is next saved.
  images: z.array(reraPropertyImageSchema).max(0, "Only one cover image is supported"),
});

export type ReraPropertyInput = z.infer<typeof reraPropertySchema>;
export type ReraPropertyImageInput = z.infer<typeof reraPropertyImageSchema>;
