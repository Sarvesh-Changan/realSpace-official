"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { siteSettingsSchema, type SiteSettingsInput } from "./schema";

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
