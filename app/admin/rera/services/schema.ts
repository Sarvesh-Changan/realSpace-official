import { z } from "zod";

export const SERVICE_ICONS = [
  { key: "building2", label: "Building / Real Estate" },
  { key: "sparkles", label: "Sparkles / Advisory" },
  { key: "briefcase", label: "Briefcase / Corporate" },
  { key: "shieldcheck", label: "Shield / Legal & Verification" },
  { key: "calculator", label: "Calculator / Home Loans" },
  { key: "keyround", label: "Key / Possession & Rental" },
] as const;

export const reraServiceSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().min(1, "Description is required").max(5000),
  iconKey: z.string().trim().optional().nullable().or(z.literal("")),
  highlights: z.array(z.string().trim()),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export type ReraServiceInput = z.infer<typeof reraServiceSchema>;

