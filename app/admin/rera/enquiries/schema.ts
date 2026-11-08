import { z } from "zod";

export const leadStatusEnum = z.enum(["NEW", "CONTACTED", "CONVERTED", "CLOSED"]);

export const reraEnquirySourceEnum = z.enum([
  "CONTACT_FORM",
  "CALLBACK",
  "PROPERTY_ENQUIRY",
  "POST_PROPERTY",
  "SITE_VISIT",
]);

export const reraInterestEnum = z.enum(["BUY", "SELL", "RENT", "OTHER"]);

export const updateEnquiryStatusSchema = z.object({
  id: z.string().min(1, "Enquiry ID is required"),
  status: leadStatusEnum,
});

export const updateEnquiryNotesSchema = z.object({
  id: z.string().min(1, "Enquiry ID is required"),
  notes: z.string().nullable().optional(),
});

export const updateEnquirySchema = z.object({
  id: z.string().min(1, "Enquiry ID is required"),
  status: leadStatusEnum,
  notes: z.string().nullable().optional(),
});

export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;

