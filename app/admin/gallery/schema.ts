import { z } from "zod";
import type { DesignType, MediaType } from "@prisma/client";

const DESIGN_TYPE_VALUES = ["INTERIOR", "EXTERIOR"] as const satisfies readonly DesignType[];
const MEDIA_TYPE_VALUES = ["IMAGE", "VIDEO"] as const satisfies readonly MediaType[];

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required").max(100, "Name too long"),
  sortOrder: z.number().int().min(0, "Sort order must be non-negative"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const imageSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  categoryId: z.string().min(1, "Category is required"),
  designType: z.enum(DESIGN_TYPE_VALUES),
  mediaType: z.enum(MEDIA_TYPE_VALUES),
  url: z.string().min(1, "Media URL is required"),
  cloudinaryId: z.string(),
  isCategoryCover: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export type ImageInput = z.infer<typeof imageSchema>;

export const bulkImageSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  categoryId: z.string().min(1, "Category is required"),
  designType: z.enum(DESIGN_TYPE_VALUES),
  isCategoryCover: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export type BulkImageInput = z.infer<typeof bulkImageSchema>;

