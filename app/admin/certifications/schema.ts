import { z } from "zod";

const imagePathOrUrl = z
  .string()
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith("/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid URL or a site-relative path starting with /" }
  )
  .optional()
  .nullable();

export const certificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  issuingBody: z.string().min(1, "Issuing body is required"),
  certificateType: z.enum(["COURSE", "MEMBERSHIP", "REGISTRATION"]),
  issueDate: z.string().optional().nullable().or(z.literal("")),
  validUntil: z.string().optional().nullable().or(z.literal("")),
  badgeLabel: z.string().min(1, "Badge label is required"),
  imageUrl: imagePathOrUrl,
  isPublished: z.boolean(),
  sortOrder: z.number(),
});

export type CertificationInput = z.infer<typeof certificationSchema>;
