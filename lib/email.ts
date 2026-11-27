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

function getReraTransporter() {
  const host = process.env.REALSPACE_SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.REALSPACE_SMTP_PORT || 465);
  const user = process.env.REALSPACE_SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.REALSPACE_SMTP_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass || !Number.isFinite(port)) throw new Error('REALSPACE RERA SMTP is not configured');
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

export async function sendReraVerificationOtp(email: string, code: string) {
  const transport = getReraTransporter();
  const user = process.env.REALSPACE_SMTP_USER!;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;color:#172b4d"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border-top:5px solid #142a50"><tr><td style="padding:30px"><div style="font-size:22px;font-weight:700;letter-spacing:2px;color:#142a50">REALSPACE</div><p style="font-size:15px;line-height:1.6">Use this code to verify your email address for your REALSPACE RERA enquiry.</p><div style="margin:24px 0;padding:16px;text-align:center;background:#f4f6f9;font-size:32px;font-weight:700;letter-spacing:8px;color:#142a50">${code}</div><p style="font-size:13px;line-height:1.6">This code expires in 5 minutes. For your security, never share it with anyone. If you did not request this code, you can ignore this email.</p></td></tr></table></td></tr></table></body></html>`;
  await transport.sendMail({ from: `REALSPACE RERA <${user}>`, to: email, subject: 'Verify your REALSPACE email address', text: `Your REALSPACE verification code is ${code}. It expires in 5 minutes. Never share this code.`, html });
  return { success: true as const };
}

export async function sendReraEnquiryAcknowledgement(email: string, name: string, appointment = false) {
  const transport = getReraTransporter();
  const user = process.env.REALSPACE_SMTP_USER!;
  const title = appointment ? 'Appointment request received' : 'Enquiry received';
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;color:#172b4d"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border-top:5px solid #142a50"><tr><td style="padding:30px"><div style="font-size:22px;font-weight:700;letter-spacing:2px;color:#142a50">REALSPACE</div><h1 style="font-size:22px">${title}</h1><p style="font-size:15px;line-height:1.6">Hello ${escapeHtml(name)},<br>Thank you for contacting REALSPACE. Our team has received your ${appointment ? 'appointment' : 'enquiry'} request and will contact you to follow up. ${appointment ? 'This request is not a confirmed site visit; our team will confirm a time with you.' : ''}</p><p style="font-size:13px;color:#667085">REALSPACE RERA Advisory</p></td></tr></table></td></tr></table></body></html>`;
  await transport.sendMail({ from: `REALSPACE RERA <${user}>`, to: email, subject: `REALSPACE: ${title}`, text: `Hello ${name}, thank you for contacting REALSPACE. We received your ${appointment ? 'appointment request' : 'enquiry'} and our team will follow up.${appointment ? ' This is a request, not a confirmed site visit.' : ''}`, html });
  return { success: true as const };
}

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

    const selections = (lead.selections as Record<string, unknown>) || {};

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

    const reraTransporter = getReraTransporter();
    const fromAddress = `REALSPACE RERA <${process.env.REALSPACE_SMTP_USER}>`;

    await reraTransporter.sendMail({
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
