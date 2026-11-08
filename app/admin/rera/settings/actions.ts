"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { reraSettingsSchema, type ReraSettingsInput } from "./schema";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteCloudinaryAsset(publicId: string | null | undefined) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete Cloudinary asset:", publicId, err);
  }
}

export async function updateReraSettings(
  data: ReraSettingsInput
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = reraSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const {
    areasServedRaw,
    instagram,
    facebook,
    youtube,
    linkedin,
    heroImageUrl,
    heroImagePublicId,
    founderImageUrl,
    founderImagePublicId,
    yearsExperience,
    happyFamilies,
    propertiesClosed,
    ...rest
  } = parsed.data;

  // Split comma-separated areas into string[]
  const areasServed = areasServedRaw
    ? areasServedRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Format clean URLs or null
  const cleanHeroUrl = heroImageUrl && heroImageUrl.trim() !== "" ? heroImageUrl.trim() : null;
  const cleanHeroPublicId = heroImagePublicId && heroImagePublicId.trim() !== "" ? heroImagePublicId.trim() : null;
  const cleanFounderUrl = founderImageUrl && founderImageUrl.trim() !== "" ? founderImageUrl.trim() : null;
  const cleanFounderPublicId = founderImagePublicId && founderImagePublicId.trim() !== "" ? founderImagePublicId.trim() : null;

  // Format non-negative integer stats or null
  const cleanYearsExp = typeof yearsExperience === "number" && !isNaN(yearsExperience) ? yearsExperience : null;
  const cleanHappyFam = typeof happyFamilies === "number" && !isNaN(happyFamilies) ? happyFamilies : null;
  const cleanPropsClosed = typeof propertiesClosed === "number" && !isNaN(propertiesClosed) ? propertiesClosed : null;

  const socialLinks = {
    instagram: instagram ?? "",
    facebook: facebook ?? "",
    youtube: youtube ?? "",
    linkedin: linkedin ?? "",
  };

  try {
    const existing = await prisma.reraSettings.findUnique({
      where: { id: "singleton" },
    });

    // Clean up old hero image if changed
    if (
      existing?.heroImagePublicId &&
      existing.heroImagePublicId !== cleanHeroPublicId
    ) {
      await deleteCloudinaryAsset(existing.heroImagePublicId);
    }

    // Clean up old founder image if changed
    if (
      existing?.founderImagePublicId &&
      existing.founderImagePublicId !== cleanFounderPublicId
    ) {
      await deleteCloudinaryAsset(existing.founderImagePublicId);
    }

    const payload = {
      ...rest,
      heroImageUrl: cleanHeroUrl,
      heroImagePublicId: cleanHeroPublicId,
      founderImageUrl: cleanFounderUrl,
      founderImagePublicId: cleanFounderPublicId,
      yearsExperience: cleanYearsExp,
      happyFamilies: cleanHappyFam,
      propertiesClosed: cleanPropsClosed,
      areasServed,
      socialLinks,
    };

    await prisma.reraSettings.upsert({
      where: { id: "singleton" },
      update: payload,
      create: {
        id: "singleton",
        ...payload,
      },
    });
  } catch (err) {
    console.error("[updateReraSettings]", err);
    return { success: false, error: "Database error. Please try again." };
  }

  revalidatePath("/rera", "layout");
  revalidatePath("/admin/rera/settings");

  return { success: true };
}

