import { z } from "zod";

export const projectImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Must be a valid image URL"),
  cloudinaryId: z.string().min(1, "Cloudinary ID is required"),
  altText: z.string().min(1, "Alt text is required for accessibility"),
  isCoverImage: z.boolean(),
  sortOrder: z.number(),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  slug: z.string().optional().or(z.literal("")),
  designType: z.enum(["INTERIOR", "EXTERIOR"]),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  category: z.enum([
    "KITCHEN",
    "LIVING_ROOM",
    "BEDROOM",
    "FULL_HOME",
    "VILLA",
    "OFFICE",
    "BUILDING_EXTERIOR",
    "FACADE_ELEVATION",
    "BALCONY_TERRACE",
    "OUTDOOR_SPACE",
    "RENOVATION",
    "OTHER",
  ]),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  servicesUsed: z.array(z.string()),
  carpetAreaSqFt: z.number().nullable().optional(),
  completionYear: z.number().nullable().optional(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: z.number(),
  images: z.array(projectImageSchema),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectImageInput = z.infer<typeof projectImageSchema>;
