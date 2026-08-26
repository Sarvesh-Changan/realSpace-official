"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  checkOtp,
  sendOtp,
} from "@/app/(public)/quote/otp-actions";
import {
  resetPasswordSchema,
  resetRequestSchema,
  resetVerifySchema,
} from "./schema";

export async function requestPasswordReset(data: unknown) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";
  const rateCheck = checkRateLimit(`password_reset_${ip}`, 5, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: "Too many reset requests. Please try again later.",
    };
  }

  const result = resetRequestSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid email address",
    };
  }

  const email = result.data.email.toLowerCase();
  const emailRateCheck = checkRateLimit(
    `password_reset_email_${email}`,
    5,
    60 * 60 * 1000
  );
  if (!emailRateCheck.allowed) {
    return {
      success: false,
      error: "Too many reset requests. Please try again later.",
    };
  }
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  // Do not reveal whether an email belongs to an admin account.
  if (!admin) {
    return {
      success: true,
      message: "If that email belongs to an admin account, a code has been sent.",
    };
  }

  const otpResult = await sendOtp(email);
  return otpResult.success
    ? { success: true, message: "A verification code has been sent to your email." }
    : { success: false, error: otpResult.error || "Unable to send verification code" };
}

export async function verifyPasswordResetCode(data: unknown) {
  const result = resetVerifySchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid verification code",
    };
  }

  const otpResult = await checkOtp(result.data.email.toLowerCase(), result.data.code);
  return otpResult.success && otpResult.verifiedToken
    ? { success: true, verifiedToken: otpResult.verifiedToken }
    : { success: false, error: otpResult.error || "Invalid verification code" };
}

export async function resetAdminPassword(data: unknown) {
  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid password reset request",
    };
  }

  const { email, verifiedToken, password } = result.data;
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  try {
    await prisma.$transaction(async (transaction) => {
      const consumed = await transaction.emailOtp.updateMany({
        where: {
          email: normalizedEmail,
          verifiedToken,
          verified: true,
          used: false,
          expiresAt: { gt: now },
        },
        data: { used: true },
      });

      if (consumed.count !== 1) {
        throw new Error("INVALID_RESET_TOKEN");
      }

      const updatedAdmin = await transaction.adminUser.updateMany({
        where: { email: normalizedEmail },
        data: { passwordHash },
      });

      if (updatedAdmin.count !== 1) {
        throw new Error("INVALID_RESET_TOKEN");
      }
    }, {
      // Neon may need several seconds to wake before accepting a transaction.
      // Keep token consumption and password update atomic while allowing that latency.
      maxWait: 15_000,
      timeout: 20_000,
    });

    // Clear either supported Auth.js session cookie in the browser making the reset.
    // The current JWT session strategy has no server-side session store to revoke
    // tokens issued to other browsers without changing the auth schema/implementation.
    const cookieStore = await cookies();
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_RESET_TOKEN") {
      return { success: false, error: "This reset link is invalid or has expired." };
    }

    console.error("Admin password reset error:", error);
    return { success: false, error: "Unable to reset password. Please try again." };
  }
}
