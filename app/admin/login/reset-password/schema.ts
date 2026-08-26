import { z } from "zod";

export const resetRequestSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export const resetVerifySchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address"),
    verifiedToken: z.string().uuid("Invalid verification token"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or fewer"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// Client-side schema for the visible password fields. The server action
// separately validates the email and verified token supplied from state.
export const newPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or fewer"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type ResetVerifyInput = z.infer<typeof resetVerifySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordFormInput = z.infer<typeof newPasswordFormSchema>;
