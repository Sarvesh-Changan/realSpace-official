import { z } from "zod";
import { DesignType, MediaType } from "@prisma/client";

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
  designType: z.nativeEnum(DesignType),
  mediaType: z.nativeEnum(MediaType),
  url: z.string().min(1, "Media URL is required"),
  cloudinaryId: z.string(),
  theme: z.string().optional().nullable(),
  approxBudgetLabel: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export type ImageInput = z.infer<typeof imageSchema>;
