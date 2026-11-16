"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { partnerSchema, type PartnerInput } from "./schema";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function authorized() {
  const session = await auth();
  return Boolean(session?.user);
}

async function deleteLogo(publicId?: string | null) {
  if (!publicId || publicId.startsWith("temp-") || publicId.startsWith("img-")) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Failed to remove RERA partner logo from Cloudinary:", error);
  }
}

function revalidatePartners() {
  revalidatePath("/rera");
  revalidatePath("/admin/rera/partners");
}

export async function createPartner(input: PartnerInput): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!(await authorized())) return { success: false, error: "Unauthorized: Admin session required." };
  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid partner details." };
  try {
    const partner = await prisma.reraBuilderPartner.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || null,
        logoPublicId: parsed.data.logoPublicId || null,
      },
    });
    revalidatePartners();
    return { success: true, id: partner.id };
  } catch (error) {
    console.error("Failed to create RERA partner:", error);
    return { success: false, error: "Could not save partner. Please try again." };
  }
}

export async function updatePartner(id: string, input: PartnerInput): Promise<{ success: boolean; error?: string }> {
  if (!(await authorized())) return { success: false, error: "Unauthorized: Admin session required." };
  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid partner details." };
  try {
    const existing = await prisma.reraBuilderPartner.findUnique({ where: { id }, select: { logoPublicId: true } });
    await prisma.reraBuilderPartner.update({
      where: { id },
      data: {
        ...parsed.data,
        description: parsed.data.description || null,
        logoPublicId: parsed.data.logoPublicId || null,
      },
    });
    if (existing?.logoPublicId && existing.logoPublicId !== parsed.data.logoPublicId) await deleteLogo(existing.logoPublicId);
    revalidatePartners();
    return { success: true };
  } catch (error) {
    console.error("Failed to update RERA partner:", error);
    return { success: false, error: "Could not update partner. Please try again." };
  }
}

export async function deletePartner(id: string): Promise<{ success: boolean; error?: string }> {
  if (!(await authorized())) return { success: false, error: "Unauthorized: Admin session required." };
  try {
    const partner = await prisma.reraBuilderPartner.delete({ where: { id }, select: { logoPublicId: true } });
    await deleteLogo(partner.logoPublicId);
    revalidatePartners();
    return { success: true };
  } catch (error) {
    console.error("Failed to delete RERA partner:", error);
    return { success: false, error: "Could not delete partner. Please try again." };
  }
}

export async function togglePartnerPublish(id: string, isPublished: boolean): Promise<{ success: boolean; error?: string }> {
  if (!(await authorized())) return { success: false, error: "Unauthorized: Admin session required." };
  try {
    await prisma.reraBuilderPartner.update({ where: { id }, data: { isPublished } });
    revalidatePartners();
    return { success: true };
  } catch (error) {
    console.error("Failed to change RERA partner visibility:", error);
    return { success: false, error: "Could not update partner visibility." };
  }
}
