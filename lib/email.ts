import { Resend } from "resend";
import type { Lead } from "@prisma/client";
import prisma from "@/lib/prisma";

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a notification email to admins when a new lead is submitted.
 * Fetches the admin recipient email from SiteSettings.
 */
export async function sendLeadNotification(
  lead: Lead
): Promise<{ success: boolean; error?: string }> {
  try {
    const siteSettings = await prisma.siteSettings.findFirst();
    const adminEmail =
      process.env.RESEND_TO_EMAIL?.trim() || siteSettings?.email?.trim();

    if (!adminEmail) {
      console.warn(
        "Lead notification warning: Admin email address is not configured in SiteSettings or RESEND_TO_EMAIL."
      );
      return {
        success: false,
        error: "Admin email address not configured.",
      };
    }

    const budgetText =
      lead.estimatedBudgetLow && lead.estimatedBudgetHigh
        ? `₹${lead.estimatedBudgetLow.toLocaleString("en-IN")} - ₹${lead.estimatedBudgetHigh.toLocaleString("en-IN")}`
        : "Not specified";

    const bodyText = `New Lead Submission Received

Name: ${lead.name}
Phone: ${lead.phone}
Email: ${lead.email || "Not provided"}
Location: ${lead.location || "Not provided"}
Source: ${lead.source}
Budget Range: ${budgetText}
Submitted At: ${lead.createdAt ? lead.createdAt.toISOString() : new Date().toISOString()}

Requirements:
${lead.requirements || "None"}
`;

    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "REALSPACE Leads <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [adminEmail],
      subject: `New Lead: ${lead.name}`,
      text: bodyText,
    });

    if (error) {
      console.error("Resend API error sending lead notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in sendLeadNotification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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

