"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";
import {
  changePasswordSchema,
  siteSettingsSchema,
  type SiteSettingsInput,
} from "./schema";

export async function updateSiteSettings(
  data: SiteSettingsInput
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = siteSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { instagram, facebook, youtube, linkedin, ...core } = parsed.data;

  try {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: {
        ...core,
        socialLinks: { instagram: instagram ?? "", facebook: facebook ?? "", youtube: youtube ?? "", linkedin: linkedin ?? "" },
      },
      create: {
        id: "singleton",
        ...core,
        socialLinks: { instagram: instagram ?? "", facebook: facebook ?? "", youtube: youtube ?? "", linkedin: linkedin ?? "" },
      },
    });
  } catch (err) {
    console.error("[updateSiteSettings]", err);
    return { success: false, error: "Database error. Please try again." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");

  return { success: true };
}

export async function changeAdminPassword(
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid password input",
    };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";
  const accountKey = session.user.id || session.user.email || "authenticated-admin";

  const admin = session.user.id
    ? await prisma.adminUser.findUnique({ where: { id: session.user.id } })
    : session.user.email
      ? await prisma.adminUser.findUnique({
          where: { email: session.user.email.toLowerCase().trim() },
        })
      : null;

  if (!admin) {
    return { success: false, error: "Unable to verify the current account." };
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    parsed.data.currentPassword,
    admin.passwordHash
  );

  if (!isCurrentPasswordValid) {
    const rateCheck = checkRateLimit(
      `change_password_${ip}_${accountKey}`,
      5,
      15 * 60 * 1000
    );

    return {
      success: false,
      error: rateCheck.allowed
        ? "Current password is incorrect."
        : "Too many failed password attempts. Please try again later.",
    };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    return { success: true };
  } catch (error) {
    console.error("[changeAdminPassword]", error);
    return { success: false, error: "Unable to change password. Please try again." };
  }
}
