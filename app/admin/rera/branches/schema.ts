import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
    message: "Must be a valid URL (https://...)",
  })
  .optional()
  .or(z.literal(""));

export const reraBranchSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Branch name is required").max(150),
  address: z.string().trim().min(1, "Address is required").max(1000),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  mapUrl: optionalUrl,
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export type ReraBranchInput = z.infer<typeof reraBranchSchema>;

