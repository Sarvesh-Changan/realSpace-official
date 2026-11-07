"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { offerSchema, type OfferInput } from "./schema";
import { v2 as cloudinary } from "cloudinary";

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

export async function createOffer(data: OfferInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = offerSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid offer data." };
  }

  const offerData = parsed.data;

  try {
    const offer = await prisma.offer.create({
      data: {
        title: offerData.title ? offerData.title.trim() : null,
        description: offerData.description ? offerData.description.trim() : null,
        imageUrl: offerData.imageUrl && offerData.imageUrl.trim() !== "" ? offerData.imageUrl.trim() : null,
        imagePublicId: offerData.imagePublicId && offerData.imagePublicId.trim() !== "" ? offerData.imagePublicId.trim() : null,
        ctaLabel: offerData.ctaLabel.trim(),
        ctaLink: offerData.ctaLink.trim(),
        isActive: offerData.isActive,
        showOnHome: offerData.showOnHome ?? false,
        startDate: offerData.startDate && offerData.startDate.trim() !== "" ? new Date(offerData.startDate) : null,
        endDate: offerData.endDate && offerData.endDate.trim() !== "" ? new Date(offerData.endDate) : null,
        sortOrder: offerData.sortOrder,
      },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/", "layout");
    return { success: true, id: offer.id };
  } catch (error) {
    console.error("Failed to create offer:", error);
    return { success: false, error: "Failed to create offer in database." };
  }
}

export async function updateOffer(id: string, data: OfferInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = offerSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid offer data." };
  }

  const offerData = parsed.data;

  try {
    const existing = await prisma.offer.findUnique({ where: { id } });

    const newPublicId = offerData.imagePublicId && offerData.imagePublicId.trim() !== "" ? offerData.imagePublicId.trim() : null;
    const newImageUrl = offerData.imageUrl && offerData.imageUrl.trim() !== "" ? offerData.imageUrl.trim() : null;

    if (existing?.imagePublicId && existing.imagePublicId !== newPublicId) {
      await deleteCloudinaryAsset(existing.imagePublicId);
    }

    await prisma.offer.update({
      where: { id },
      data: {
        title: offerData.title ? offerData.title.trim() : null,
        description: offerData.description ? offerData.description.trim() : null,
        imageUrl: newImageUrl,
        imagePublicId: newPublicId,
        ctaLabel: offerData.ctaLabel.trim(),
        ctaLink: offerData.ctaLink.trim(),
        isActive: offerData.isActive,
        showOnHome: offerData.showOnHome ?? false,
        startDate: offerData.startDate && offerData.startDate.trim() !== "" ? new Date(offerData.startDate) : null,
        endDate: offerData.endDate && offerData.endDate.trim() !== "" ? new Date(offerData.endDate) : null,
        sortOrder: offerData.sortOrder,
      },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update offer:", error);
    return { success: false, error: "Failed to update offer in database." };
  }
}

export async function toggleOfferShowOnHomeAction(id: string, showOnHome: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.offer.update({
      where: { id },
      data: { showOnHome },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update offer showOnHome:", error);
    return { success: false, error: "Failed to update offer showOnHome." };
  }
}

export async function deleteOffer(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const existing = await prisma.offer.findUnique({ where: { id } });
    if (existing?.imagePublicId) {
      await deleteCloudinaryAsset(existing.imagePublicId);
    }

    await prisma.offer.delete({
      where: { id },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete offer:", error);
    return { success: false, error: "Failed to delete offer from database." };
  }
}
