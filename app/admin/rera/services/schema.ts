import { z } from "zod";

export const SERVICE_ICONS = [
  { key: "building2", label: "Building / Real Estate" },
  { key: "sparkles", label: "Sparkles / Advisory" },
  { key: "briefcase", label: "Briefcase / Corporate" },
  { key: "shieldcheck", label: "Shield / Legal & Verification" },
  { key: "calculator", label: "Calculator / Home Loans" },
  { key: "keyround", label: "Key / Possession & Rental" },
] as const;

// Existing service content can use either a public site asset path or an
// absolute HTTP(S) URL (including Cloudinary uploads).
const serviceImageUrlSchema = z.string().trim().refine((value) => {
  if (!value) return true;
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      return Boolean(parsed.hostname) && (parsed.protocol === "https:" || parsed.protocol === "http:");
    } catch {
      return false;
    }
  }
  return /^\/(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[^\s]*$/.test(value);
}, "Enter a valid image URL or site path");

export const reraServiceSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().min(1, "Description is required").max(5000),
  iconKey: z.string().trim().optional().nullable().or(z.literal("")),
  highlights: z.array(z.string().trim()),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
  slug: z.string().trim().min(1, "A public service slug is required").max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens for the slug"),
  shortDescription: z.string().trim().max(1000).optional().nullable().or(z.literal("")),
  pageHeading: z.string().trim().max(200).optional().nullable().or(z.literal("")),
  bannerImageUrl: serviceImageUrlSchema.optional().nullable().or(z.literal("")),
  bannerImagePublicId: z.string().trim().optional().nullable().or(z.literal("")),
  bannerImageAlt: z.string().trim().max(300).optional().nullable().or(z.literal("")),
  contentImages: z.array(z.object({ url: serviceImageUrlSchema, publicId: z.string().optional(), alt: z.string().optional(), order: z.number().int().optional(), placement: z.enum(["content", "loan-partner"]).optional() })).optional(),
  sections: z.array(z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    imagePublicId: z.string().optional(),
    imageAlt: z.string().optional(),
    items: z.array(z.object({ title: z.string().optional(), description: z.string().optional(), imageUrl: z.string().optional(), imagePublicId: z.string().optional(), imageAlt: z.string().optional() })).optional(),
  })).optional(),
  ctaText: z.string().trim().max(100).optional().nullable().or(z.literal("")),
  ctaUrl: z.string().trim().max(500).optional().nullable().or(z.literal("")),
}).superRefine((service, ctx) => {
  (service.contentImages ?? []).forEach((image, index) => {
    if (image.placement !== "loan-partner") return;
    if (!image.url.startsWith("https://res.cloudinary.com/") || !image.publicId) {
      ctx.addIssue({ code: "custom", path: ["contentImages", index], message: "Home loan logos must be uploaded to Cloudinary." });
    }
    if (!image.alt?.trim()) {
      ctx.addIssue({ code: "custom", path: ["contentImages", index, "alt"], message: "Add an accessible name for each bank logo." });
    }
  });
});

export type ReraServiceInput = z.infer<typeof reraServiceSchema>;

