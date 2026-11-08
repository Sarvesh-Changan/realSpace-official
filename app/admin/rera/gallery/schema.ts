import { z } from "zod";

export const RERA_GALLERY_CATEGORIES = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "ONGOING", label: "Ongoing Projects" },
  { value: "HANDOVER", label: "Handovers" },
  { value: "OTHER", label: "Other" },
] as const;

export const galleryCategoryEnum = z.enum([
  "RESIDENTIAL",
  "COMMERCIAL",
  "ONGOING",
  "HANDOVER",
  "OTHER",
]);

export const mediaTypeEnum = z.enum(["IMAGE", "VIDEO"]);

export const reraGalleryItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required").max(250),
  category: galleryCategoryEnum,
  mediaType: mediaTypeEnum,
  url: z.string().min(1, "Media URL is required"),
  publicId: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  thumbnailPublicId: z.string().nullable().optional(),
  fileSizeBytes: z.number().int().nullable().optional(),
  cloudinaryEtag: z.string().nullable().optional(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export type ReraGalleryItemInput = z.infer<typeof reraGalleryItemSchema>;

export const uploadedMediaItemSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().nullable().optional(),
  mediaType: mediaTypeEnum,
  thumbnailUrl: z.string().nullable().optional(),
  thumbnailPublicId: z.string().nullable().optional(),
  fileSizeBytes: z.number().int().nullable().optional(),
  cloudinaryEtag: z.string().nullable().optional(),
  fileName: z.string().optional(),
});

export const bulkGalleryCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(250),
  category: galleryCategoryEnum,
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
  items: z.array(uploadedMediaItemSchema).min(1, "At least one file must be uploaded"),
});

export type BulkGalleryCreateInput = z.infer<typeof bulkGalleryCreateSchema>;
export type UploadedMediaItem = z.infer<typeof uploadedMediaItemSchema>;

