import { z } from "zod";

export const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "Question is required").max(1000, "Question is too long"),
  answer: z.string().min(1, "Answer is required"),
  sortOrder: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
});

export type FaqFormValues = z.infer<typeof faqSchema>;
