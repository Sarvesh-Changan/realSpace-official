"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendOtpEmail } from "@/lib/email";

const emailSchema = z.string().email("Invalid email address format.");

type OtpActionResult = {
  success: boolean;
  error?: string;
  verifiedToken?: string;
};

/**
 * Sends a 6-digit OTP code to the provided email address.
 * Hashes the code before storing in the database.
 * Enforces a 60-second resend cooldown and a maximum of 5 requests per email per hour.
 */
export async function sendOtp(rawEmail: unknown): Promise<OtpActionResult> {
  try {
    // 1. IP Rate Limiting Check (max 5 requests per 15 minutes per IP)
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";

    const rateCheck = checkRateLimit(`otp_send_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: "Too many verification code requests from this IP. Please try again later.",
      };
    }

    // 2. Input Validation
    if (typeof rawEmail !== "string") {
      return {
        success: false,
        error: "Email address must be a string.",
      };
    }

    const normalizedEmail = rawEmail.trim().toLowerCase();
    const validation = emailSchema.safeParse(normalizedEmail);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid email address format.",
      };
    }

    // 3. Find existing OTP record for this email
    const existingOtp = await prisma.emailOtp.findFirst({
      where: { email: normalizedEmail },
      orderBy: { lastSentAt: "desc" },
    });

    const now = new Date();

    // 4. Enforce 60-second resend cooldown per email
    if (existingOtp) {
      const timeSinceLastSent = now.getTime() - existingOtp.lastSentAt.getTime();
      if (timeSinceLastSent < 60000) {
        const waitSeconds = Math.ceil((60000 - timeSinceLastSent) / 1000);
        return {
          success: false,
          error: `Please wait ${waitSeconds} second(s) before requesting another code.`,
        };
      }
    }

    // 5. Enforce max 5 sends per email per hour
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const hourlySendCount = await prisma.emailOtp.count({
      where: {
        email: normalizedEmail,
        lastSentAt: { gte: oneHourAgo },
      },
    });

    if (hourlySendCount >= 5) {
      return {
        success: false,
        error: "Maximum verification code requests reached for this email. Please try again in 1 hour.",
      };
    }

    // 6. Generate random 6-digit numeric OTP code
    const rawCode = crypto.randomInt(100000, 1000000).toString();

    // 7. Hash the OTP code with bcrypt (never store raw code)
    const otpHash = await bcrypt.hash(rawCode, 10);

    // 8. Expiry time set to 5 minutes from now
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    // 9. Upsert EmailOtp row
    if (existingOtp) {
      await prisma.emailOtp.update({
        where: { id: existingOtp.id },
        data: {
          otpHash,
          expiresAt,
          attempts: 0,
          verified: false,
          verifiedToken: null,
          used: false,
          lastSentAt: now,
        },
      });
    } else {
      await prisma.emailOtp.create({
        data: {
          email: normalizedEmail,
          otpHash,
          expiresAt,
          attempts: 0,
          maxAttempts: 5,
          verified: false,
          used: false,
          lastSentAt: now,
        },
      });
    }

    // 10. Send the raw OTP code via email
    const emailResult = await sendOtpEmail(normalizedEmail, rawCode);
    if (!emailResult.success) {
      console.error("Failed to send OTP email via Gmail SMTP:", emailResult.error);
      return {
        success: false,
        error: "Failed to deliver verification email. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in sendOtp action:", error);
    return {
      success: false,
      error: "An unexpected error occurred while requesting verification code.",
    };
  }
}

/**
 * Verifies the submitted 6-digit OTP code against the hashed OTP in the database.
 * Enforces a maximum of 5 verification attempts per EmailOtp row.
 * On success, generates a single-use verifiedToken (UUID) and marks the record verified.
 */
export async function checkOtp(
  rawEmail: unknown,
  rawCode: unknown
): Promise<OtpActionResult> {
  try {
    // 1. IP Rate Limiting Check (max 10 verification attempts per 15 minutes per IP)
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";

    const rateCheck = checkRateLimit(`otp_check_${ip}`, 10, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: "Too many verification attempts from this IP. Please try again later.",
      };
    }

    // 2. Input Validation
    if (typeof rawEmail !== "string" || typeof rawCode !== "string") {
      return {
        success: false,
        error: "Invalid or expired verification code.",
      };
    }

    const normalizedEmail = rawEmail.trim().toLowerCase();
    const trimmedCode = rawCode.trim();

    if (!normalizedEmail || !trimmedCode || trimmedCode.length !== 6) {
      return {
        success: false,
        error: "Invalid or expired verification code.",
      };
    }

    // 3. Find the latest OTP record for this email
    const existingOtp = await prisma.emailOtp.findFirst({
      where: { email: normalizedEmail },
      orderBy: { lastSentAt: "desc" },
    });

    if (!existingOtp) {
      return {
        success: false,
        error: "Invalid or expired verification code.",
      };
    }

    // 4. Check maximum allowed verification attempts (max 5)
    if (existingOtp.attempts >= existingOtp.maxAttempts) {
      return {
        success: false,
        error: "Maximum verification attempts exceeded. Please request a new code.",
      };
    }

    // 5. Check if the code has expired (5-minute expiration)
    if (Date.now() > existingOtp.expiresAt.getTime()) {
      return {
        success: false,
        error: "Verification code has expired. Please request a new code.",
      };
    }

    // 6. Compare submitted code with stored bcrypt hash
    const isValid = await bcrypt.compare(trimmedCode, existingOtp.otpHash);

    if (!isValid) {
      // Increment failed attempts count
      await prisma.emailOtp.update({
        where: { id: existingOtp.id },
        data: {
          attempts: existingOtp.attempts + 1,
        },
      });

      return {
        success: false,
        error: "Invalid or expired verification code.",
      };
    }

    // 7. On successful verification:
    // Generate a single-use verifiedToken (UUID) and update database
    const verifiedToken = crypto.randomUUID();

    await prisma.emailOtp.update({
      where: { id: existingOtp.id },
      data: {
        verified: true,
        verifiedToken,
        used: false,
        attempts: 0,
      },
    });

    return {
      success: true,
      verifiedToken,
    };
  } catch (error) {
    console.error("Error in checkOtp action:", error);
    return {
      success: false,
      error: "An unexpected error occurred while verifying the code.",
    };
  }
}
