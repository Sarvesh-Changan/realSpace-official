import { z } from "zod";

export const eventMediaSchema = z.object({
  id: z.string().optional(),
  mediaUrl: z.string().min(1, "Media URL is required"),
  mediaPublicId: z.string().optional().nullable(),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  sortOrder: z.number().int().min(0, "Sort order must be non-negative").default(0),
});

export type EventMediaInput = z.infer<typeof eventMediaSchema>;

export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().min(1, "Slug is required").max(200, "Slug too long"),
  coverImageUrl: z.string().min(1, "Cover image is required"),
  coverImagePublicId: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().min(0, "Sort order must be non-negative").default(0),
  media: z.array(eventMediaSchema).default([]),
});

export type EventInput = z.infer<typeof eventSchema>;
