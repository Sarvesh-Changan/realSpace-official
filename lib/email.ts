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

    const selections = (lead.selections as Record<string, any>) || {};

    const roomType = selections.bhkType || "Not specified";

    let materialPackage = "Not specified";
    if (selections.packageTier) {
      const tierUpper = String(selections.packageTier).toUpperCase();
      if (tierUpper.includes("BUDGET")) materialPackage = "Budget";
      else if (tierUpper.includes("PREMIUM")) materialPackage = "Premium";
      else if (tierUpper.includes("LUXURY")) materialPackage = "Luxury";
      else if (tierUpper.includes("STANDARD")) materialPackage = "Standard";
      else materialPackage = String(selections.packageTier);
    }

    let estimatedPriceText = "Custom Quote Required";
    if (lead.estimatedBudget != null) {
      estimatedPriceText = `₹${lead.estimatedBudget.toLocaleString("en-IN")}`;
    } else if (lead.estimatedBudgetLow != null && lead.estimatedBudgetHigh != null) {
      estimatedPriceText = `₹${lead.estimatedBudgetLow.toLocaleString("en-IN")} - ₹${lead.estimatedBudgetHigh.toLocaleString("en-IN")}`;
    }

    const bodyText = `New Lead Submission Received

Name: ${lead.name}
Phone: ${lead.phone}
Email: ${lead.email || "Not provided"}
Location: ${lead.location || "Not provided"}
Source: ${lead.source}
Room Type: ${roomType}
Material Package: ${materialPackage}
Estimated Price: ${estimatedPriceText}
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

export interface ReraEnquiryNotificationData {
  name: string;
  phone: string;
  email?: string | null;
  interestedIn: string;
  budgetLabel?: string | null;
  locality?: string | null;
  message?: string | null;
  source: string;
  propertyTitle?: string | null;
  details?: Record<string, string> | null;
  createdAt?: Date | string;
}

/**
 * Sends a notification email to admins when a new RERA enquiry is submitted.
 * Recipient: ReraSettings.email, falling back to SiteSettings.email.
 */
export async function sendReraEnquiryNotification(
  enquiry: ReraEnquiryNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const [reraSettings, siteSettings] = await Promise.all([
      prisma.reraSettings.findUnique({ where: { id: "singleton" } }),
      prisma.siteSettings.findFirst(),
    ]);

    const adminEmail =
      process.env.RESEND_TO_EMAIL?.trim() ||
      reraSettings?.email?.trim() ||
      siteSettings?.email?.trim();

    if (!adminEmail) {
      console.warn("RERA enquiry notification warning: Admin email address not configured.");
      return { success: false, error: "Recipient email not configured." };
    }

    const timestamp = enquiry.createdAt
      ? typeof enquiry.createdAt === "string"
        ? enquiry.createdAt
        : enquiry.createdAt.toISOString()
      : new Date().toISOString();

    let detailsText = "";
    if (enquiry.details && Object.keys(enquiry.details).length > 0) {
      detailsText =
        "\nAdditional Details:\n" +
        Object.entries(enquiry.details)
          .map(([k, v]) => `  ${k}: ${v}`)
          .join("\n");
    }

    const bodyText = `New RERA Enquiry Received

Source: ${enquiry.source}
Submitted At: ${timestamp}
${enquiry.propertyTitle ? `Property: ${enquiry.propertyTitle}\n` : ""}
Name: ${enquiry.name}
Phone: ${enquiry.phone}
Email: ${enquiry.email || "Not provided"}
Interested In: ${enquiry.interestedIn}
Locality: ${enquiry.locality || "Not specified"}
Budget: ${enquiry.budgetLabel || "Not specified"}
${enquiry.message ? `\nMessage:\n${enquiry.message}\n` : ""}${detailsText}
`;

    const fromAddress = process.env.GMAIL_USER
      ? `REALSPACE RERA <${process.env.GMAIL_USER}>`
      : "REALSPACE RERA <noreply@gmail.com>";

    await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `New RERA Enquiry [${enquiry.source}]: ${enquiry.name}`,
      text: bodyText,
    });

    return { success: true };
  } catch (error) {
    console.error("Gmail SMTP error sending RERA enquiry notification:", error instanceof Error ? error.message : "Unknown error");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
