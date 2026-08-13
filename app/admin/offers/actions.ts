"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { offerSchema, type OfferInput } from "./schema";

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
        title: offerData.title.trim(),
        description: offerData.description.trim(),
        imageUrl: offerData.imageUrl && offerData.imageUrl.trim() !== "" ? offerData.imageUrl.trim() : null,
        ctaLabel: offerData.ctaLabel.trim(),
        ctaLink: offerData.ctaLink.trim(),
        isActive: offerData.isActive,
        startDate: offerData.startDate && offerData.startDate.trim() !== "" ? new Date(offerData.startDate) : null,
        endDate: offerData.endDate && offerData.endDate.trim() !== "" ? new Date(offerData.endDate) : null,
        sortOrder: offerData.sortOrder,
      },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/");
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
    await prisma.offer.update({
      where: { id },
      data: {
        title: offerData.title.trim(),
        description: offerData.description.trim(),
        imageUrl: offerData.imageUrl && offerData.imageUrl.trim() !== "" ? offerData.imageUrl.trim() : null,
        ctaLabel: offerData.ctaLabel.trim(),
        ctaLink: offerData.ctaLink.trim(),
        isActive: offerData.isActive,
        startDate: offerData.startDate && offerData.startDate.trim() !== "" ? new Date(offerData.startDate) : null,
        endDate: offerData.endDate && offerData.endDate.trim() !== "" ? new Date(offerData.endDate) : null,
        sortOrder: offerData.sortOrder,
      },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update offer:", error);
    return { success: false, error: "Failed to update offer in database." };
  }
}

export async function deleteOffer(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.offer.delete({
      where: { id },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete offer:", error);
    return { success: false, error: "Failed to delete offer from database." };
  }
}
