import { Resend } from "resend";
import type { Lead } from "@prisma/client";

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a notification email to admins when a new lead is submitted.
 * TODO: Implement transactional lead notification template in subsequent step.
 */
export async function sendLeadNotification(
  lead: Lead
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement lead notification email delivery using Resend
  throw new Error("sendLeadNotification is not yet implemented.");
}

/**
 * Sends an OTP email to a user for quote submission verification.
 * TODO: Implement OTP email template and delivery in subsequent step.
 */
export async function sendOtpEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement OTP email delivery using Resend
  throw new Error("sendOtpEmail is not yet implemented.");
}
