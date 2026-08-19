import { z } from "zod";

export const certificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  issuingBody: z.string().min(1, "Issuing body is required"),
  certificateType: z.enum(["COURSE", "MEMBERSHIP", "REGISTRATION"]),
  issueDate: z.string().optional().nullable().or(z.literal("")),
  validUntil: z.string().optional().nullable().or(z.literal("")),
  badgeLabel: z.string().min(1, "Badge label is required"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
  isPublished: z.boolean(),
  sortOrder: z.number(),
});

export type CertificationInput = z.infer<typeof certificationSchema>;
