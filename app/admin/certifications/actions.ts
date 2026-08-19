"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { certificationSchema, type CertificationInput } from "./schema";

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
        isPublished: certData.isPublished,
        sortOrder: certData.sortOrder,
      },
    });

    revalidatePath("/admin/certifications");
    revalidatePath("/about");
    revalidatePath("/");
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
        isPublished: certData.isPublished,
        sortOrder: certData.sortOrder,
      },
    });

    revalidatePath("/admin/certifications");
    revalidatePath(`/admin/certifications/${id}`);
    revalidatePath("/about");
    revalidatePath("/");
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
    await prisma.certification.delete({
      where: { id },
    });

    revalidatePath("/admin/certifications");
    revalidatePath("/about");
    revalidatePath("/");
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
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle certification publish status:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}
