import { z } from "zod";

export const reraFaqSchema = z.object({
  id: z.string().optional(),
  question: z.string().trim().min(1, "Question is required").max(500),
  answer: z.string().trim().min(1, "Answer is required").max(10000),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export type ReraFaqInput = z.infer<typeof reraFaqSchema>;

