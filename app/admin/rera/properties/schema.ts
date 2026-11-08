import { z } from "zod";

export const propertySpecificationSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  value: z.string().trim().min(1, "Value is required"),
});

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
  slug: z.string().trim().max(250).optional().or(z.literal("")),
  listingType: z.enum(["SALE", "RENT"]),
  propertyType: z.enum(["APARTMENT", "VILLA", "COMMERCIAL", "PLOT", "OTHER"]),
  bhkLabel: z.string().trim().max(50).optional().or(z.literal("")),
  priceLabel: z.string().trim().min(1, "Price display label is required"),
  priceAmount: z.number().int().positive("Must be a positive whole number").nullable().optional(),
  carpetAreaSqFt: z.number().int().nonnegative().nullable().optional(),
  builtUpAreaSqFt: z.number().int().nonnegative().nullable().optional(),
  furnishing: z.string().trim().max(100).optional().or(z.literal("")),
  locality: z.string().trim().min(1, "Locality is required").max(150),
  city: z.string().trim().max(100),
  projectName: z.string().trim().max(200).optional().or(z.literal("")),
  builderName: z.string().trim().max(200).optional().or(z.literal("")),
  projectReraNo: z.string().trim().max(100).optional().or(z.literal("")),
  possession: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().max(10000).optional().or(z.literal("")),
  coverImageUrl: z.string().trim().nullable().optional().or(z.literal("")),
  coverImagePublicId: z.string().trim().nullable().optional().or(z.literal("")),
  isFeatured: z.boolean(),
  isNewLaunch: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: z.number().int(),
  amenities: z.array(z.string().trim()),
  specifications: z.array(propertySpecificationSchema),
  images: z.array(reraPropertyImageSchema),
});

export type ReraPropertyInput = z.infer<typeof reraPropertySchema>;
export type ReraPropertyImageInput = z.infer<typeof reraPropertyImageSchema>;
export type PropertySpecificationInput = z.infer<typeof propertySpecificationSchema>;
