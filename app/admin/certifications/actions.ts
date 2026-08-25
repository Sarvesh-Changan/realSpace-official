"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { certificationSchema, type CertificationInput } from "./schema";
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

export async function createCertification(data: CertificationInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = certificationSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid certification data." };
  }

  const certData = parsed.data;

  try {
    const cert = await prisma.certification.create({
      data: {
        title: certData.title,
        issuingBody: certData.issuingBody,
        certificateType: certData.certificateType,
        issueDate: certData.issueDate ? new Date(certData.issueDate) : null,
        validUntil: certData.validUntil ? new Date(certData.validUntil) : null,
        badgeLabel: certData.badgeLabel,
        imageUrl: certData.imageUrl || null,
        imagePublicId: certData.imagePublicId || null,
        certificateUrl: certData.certificateUrl || null,
        showCertificateButton: certData.showCertificateButton ?? false,
        isPublished: certData.isPublished,
        sortOrder: certData.sortOrder,
      },
    });

    revalidatePath("/admin/certifications");
    revalidatePath("/about");
    revalidatePath("/", "layout");
    return { success: true, id: cert.id };
  } catch (error) {
    console.error("Failed to create certification:", error);
    return { success: false, error: "Failed to create certification in database." };
  }
}

export async function updateCertification(id: string, data: CertificationInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = certificationSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid certification data." };
  }

  const certData = parsed.data;

  try {
    const existing = await prisma.certification.findUnique({ where: { id } });

    const newPublicId = certData.imagePublicId || null;
    if (existing?.imagePublicId && existing.imagePublicId !== newPublicId) {
      await deleteCloudinaryAsset(existing.imagePublicId);
    }

    await prisma.certification.update({
      where: { id },
      data: {
        title: certData.title,
        issuingBody: certData.issuingBody,
        certificateType: certData.certificateType,
        issueDate: certData.issueDate ? new Date(certData.issueDate) : null,
        validUntil: certData.validUntil ? new Date(certData.validUntil) : null,
        badgeLabel: certData.badgeLabel,
        imageUrl: certData.imageUrl || null,
        imagePublicId: newPublicId,
        certificateUrl: certData.certificateUrl || null,
        showCertificateButton: certData.showCertificateButton ?? false,
        isPublished: certData.isPublished,
        sortOrder: certData.sortOrder,
      },
    });

    revalidatePath("/admin/certifications");
    revalidatePath(`/admin/certifications/${id}`);
    revalidatePath("/about");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update certification:", error);
    return { success: false, error: "Failed to update certification in database." };
  }
}

export async function deleteCertification(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const existing = await prisma.certification.findUnique({ where: { id } });
    if (existing?.imagePublicId) {
      await deleteCloudinaryAsset(existing.imagePublicId);
    }

    await prisma.certification.delete({
      where: { id },
    });

    revalidatePath("/admin/certifications");
    revalidatePath("/about");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete certification:", error);
    return { success: false, error: "Failed to delete certification." };
  }
}

export async function toggleCertificationStatus(id: string, isPublished: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.certification.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/admin/certifications");
    revalidatePath("/about");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle certification publish status:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}
