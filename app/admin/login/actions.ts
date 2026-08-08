"use server";

import { loginSchema } from "./schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function loginServerAction(data: unknown) {
  // 1. Input validation via Zod
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid credentials format",
    };
  }

  const { email, password } = result.data;

  // 2. Rate limiting check (max 5 attempts per 15 min per IP)
  const headerList = await headers();
  const rawIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(rawIp, 5, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    const minutesLeft = Math.ceil(
      (rateCheck.resetTime - Date.now()) / (60 * 1000)
    );
    return {
      success: false,
      error: `Too many login attempts. Please try again after ${minutesLeft} minute(s).`,
    };
  }

  // 3. Verify user and password hash
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.passwordHash) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  return { success: true };
}
