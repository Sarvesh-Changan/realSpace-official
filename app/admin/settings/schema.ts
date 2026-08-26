import { z } from "zod";

export const siteSettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().min(1, "WhatsApp number is required"),
  address: z.string().min(1, "Address is required"),
  heroHeadline: z.string().min(1, "Hero headline is required"),
  heroSubhead: z.string().min(1, "Hero subhead is required"),
  ctaText: z.string().min(1, "CTA text is required"),
  instagram: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  facebook: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  youtube: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  linkedin: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password must be 128 characters or fewer"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "New passwords do not match",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
