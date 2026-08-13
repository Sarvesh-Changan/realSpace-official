import nodemailer from "nodemailer";
import type { Lead } from "@prisma/client";
import prisma from "@/lib/prisma";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Sends a notification email to admins when a new lead is submitted.
 * Fetches the admin recipient email from SiteSettings, with RESEND_TO_EMAIL override option.
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

    const fromAddress = process.env.GMAIL_USER
      ? `REALSPACE Leads <${process.env.GMAIL_USER}>`
      : "REALSPACE Leads <noreply@gmail.com>";

    await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `New Lead: ${lead.name}`,
      text: bodyText,
    });

    return { success: true };
  } catch (error) {
    console.error("Gmail SMTP error sending lead notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sends an OTP email to a user for quote submission verification.
 * Always sends directly to the customer's provided email address.
 */
export async function sendOtpEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const recipient = email.trim();
    const fromAddress = process.env.GMAIL_USER
      ? `REALSPACE <${process.env.GMAIL_USER}>`
      : "REALSPACE <noreply@gmail.com>";

    const bodyText = `Your verification code is: ${code}. This code expires in 5 minutes.`;

    await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      subject: "Your REALSPACE verification code",
      text: bodyText,
    });

    return { success: true };
  } catch (error) {
    console.error("Gmail SMTP error sending OTP email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
