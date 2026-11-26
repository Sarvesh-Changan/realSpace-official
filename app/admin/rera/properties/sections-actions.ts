"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { collectSectionAssetPublicIds } from "@/lib/rera/property-sections/assets";
import { reraPropertySectionSchema } from "@/lib/rera/property-sections/schemas";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const idSchema = z.string().trim().min(1).max(191);
const sectionMutationSchema = z.object({
  propertyId: idSchema,
  section: reraPropertySectionSchema,
});
const sectionActionSchema = z.object({ propertyId: idSchema, sectionId: idSchema });

async function isAdminSession(): Promise<boolean> {
  const session = await auth();
  return Boolean(session?.user);
}

function revalidatePropertyPaths(slug: string) {
  revalidatePath("/rera/properties");
  revalidatePath(`/rera/properties/${slug}`);
  revalidatePath("/admin/rera/properties");
}

async function destroySectionAssets(publicIds: string[]) {
  await Promise.all(publicIds.map(async (publicId) => {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (error) {
      console.error(`Failed to delete RERA property section image (${publicId}):`, error);
    }
  }));
}

export async function createSection(input: unknown): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!(await isAdminSession())) return { success: false, error: "Unauthorized: Admin session required." };
  const parsed = sectionMutationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues.map((issue) => issue.message).join(", ") };

  try {
    const property = await prisma.reraProperty.findUnique({ where: { id: parsed.data.propertyId }, select: { slug: true } });
    if (!property) return { success: false, error: "Property not found." };

    const section = await prisma.$transaction(async (tx) => {
      const count = await tx.reraPropertySection.count({ where: { propertyId: parsed.data.propertyId } });
      if (count >= 20) throw new Error("SECTION_LIMIT");
      return tx.reraPropertySection.create({
        data: {
          propertyId: parsed.data.propertyId,
          type: parsed.data.section.type,
          title: parsed.data.section.title?.trim() || null,
          data: parsed.data.section.data,
          sortOrder: count,
          isPublished: true,
        },
      });
    }, { maxWait: 5000, timeout: 15000, isolationLevel: "Serializable" });

    revalidatePropertyPaths(property.slug);
    return { success: true, id: section.id };
  } catch (error) {
    if (error instanceof Error && error.message === "SECTION_LIMIT") {
      return { success: false, error: "A property can have no more than 20 sections." };
    }
    console.error("Failed to create RERA property section:", error);
    return { success: false, error: "Could not create the section." };
  }
}

export async function updateSection(input: unknown): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminSession())) return { success: false, error: "Unauthorized: Admin session required." };
  const parsed = sectionMutationSchema.extend({ sectionId: idSchema }).safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues.map((issue) => issue.message).join(", ") };

  try {
    const [property, existing] = await Promise.all([
      prisma.reraProperty.findUnique({ where: { id: parsed.data.propertyId }, select: { slug: true } }),
      prisma.reraPropertySection.findFirst({ where: { id: parsed.data.sectionId, propertyId: parsed.data.propertyId } }),
    ]);
    if (!property || !existing) return { success: false, error: "Property section not found." };

    const nextData = parsed.data.section.data;
    await prisma.reraPropertySection.update({
      where: { id: existing.id },
      data: {
        type: parsed.data.section.type,
        title: parsed.data.section.title?.trim() || null,
        data: nextData,
      },
    });

    const retained = new Set(collectSectionAssetPublicIds(nextData));
    await destroySectionAssets(collectSectionAssetPublicIds(existing.data).filter((id) => !retained.has(id)));
    revalidatePropertyPaths(property.slug);
    revalidatePath(`/admin/rera/properties/${parsed.data.propertyId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update RERA property section:", error);
    return { success: false, error: "Could not update the section." };
  }
}

export async function toggleSectionPublished(input: unknown): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminSession())) return { success: false, error: "Unauthorized: Admin session required." };
  const parsed = sectionActionSchema.extend({ isPublished: z.boolean() }).safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid section publication update." };

  try {
    const [property, section] = await Promise.all([
      prisma.reraProperty.findUnique({ where: { id: parsed.data.propertyId }, select: { slug: true } }),
      prisma.reraPropertySection.findFirst({ where: { id: parsed.data.sectionId, propertyId: parsed.data.propertyId }, select: { id: true } }),
    ]);
    if (!property || !section) return { success: false, error: "Property section not found." };
    await prisma.reraPropertySection.update({ where: { id: section.id }, data: { isPublished: parsed.data.isPublished } });
    revalidatePropertyPaths(property.slug);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle RERA property section publication:", error);
    return { success: false, error: "Could not update section publication." };
  }
}

export async function deleteSection(input: unknown): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminSession())) return { success: false, error: "Unauthorized: Admin session required." };
  const parsed = sectionActionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid section deletion request." };

  try {
    const [property, section] = await Promise.all([
      prisma.reraProperty.findUnique({ where: { id: parsed.data.propertyId }, select: { slug: true } }),
      prisma.reraPropertySection.findFirst({ where: { id: parsed.data.sectionId, propertyId: parsed.data.propertyId } }),
    ]);
    if (!property || !section) return { success: false, error: "Property section not found." };
    await prisma.reraPropertySection.delete({ where: { id: section.id } });
    await destroySectionAssets(collectSectionAssetPublicIds(section.data));
    revalidatePropertyPaths(property.slug);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete RERA property section:", error);
    return { success: false, error: "Could not delete the section." };
  }
}

export async function reorderSections(input: unknown): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminSession())) return { success: false, error: "Unauthorized: Admin session required." };
  const parsed = z.object({ propertyId: idSchema, sectionIds: z.array(idSchema).max(20) }).safeParse(input);
  if (!parsed.success || new Set(parsed.data?.sectionIds ?? []).size !== (parsed.data?.sectionIds.length ?? 0)) {
    return { success: false, error: "Invalid section order." };
  }

  try {
    const [property, sections] = await Promise.all([
      prisma.reraProperty.findUnique({ where: { id: parsed.data.propertyId }, select: { slug: true } }),
      prisma.reraPropertySection.findMany({ where: { propertyId: parsed.data.propertyId }, select: { id: true, type: true, title: true, data: true, sortOrder: true, isPublished: true } }),
    ]);
    if (!property) return { success: false, error: "Property not found." };
    if (sections.some((section) => !reraPropertySectionSchema.safeParse(section).success)) {
      return { success: false, error: "One or more sections contain invalid data and cannot be reordered." };
    }
    const existingIds = new Set(sections.map((section) => section.id));
    if (parsed.data.sectionIds.length !== sections.length || parsed.data.sectionIds.some((id) => !existingIds.has(id))) {
      return { success: false, error: "Section order is out of date. Refresh the page and try again." };
    }

    await prisma.$transaction(
      parsed.data.sectionIds.map((id, index) => prisma.reraPropertySection.update({ where: { id }, data: { sortOrder: index } })),
      { maxWait: 5000, timeout: 15000 },
    );
    revalidatePropertyPaths(property.slug);
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder RERA property sections:", error);
    return { success: false, error: "Could not reorder the sections." };
  }
}
