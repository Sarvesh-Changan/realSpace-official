"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { reraServiceSchema, type ReraServiceInput } from "./schema";

export async function createService(data: ReraServiceInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraServiceSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid service data." };
  }

  const { title, description, iconKey, highlights, sortOrder, isPublished, ...page } = parsed.data;
  const slug = normalizeSlug(page.slug);

  try {
    const service = await prisma.reraService.create({
      data: {
        title,
        description,
        iconKey: iconKey && iconKey.trim() !== "" ? iconKey.trim() : null,
        highlights,
        sortOrder,
        isPublished,
        ...pageData(page, slug),
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/services");

    return { success: true, id: service.id };
  } catch (error) {
    console.error("Failed to create RERA service:", error);
    return { success: false, error: "Failed to create service in database." };
  }
}

export async function updateService(id: string, data: ReraServiceInput): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraServiceSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid service data." };
  }

  const { title, description, iconKey, highlights, sortOrder, isPublished, ...page } = parsed.data;
  const slug = normalizeSlug(page.slug);

  try {
    await prisma.reraService.update({
      where: { id },
      data: {
        title,
        description,
        iconKey: iconKey && iconKey.trim() !== "" ? iconKey.trim() : null,
        highlights,
        sortOrder,
        isPublished,
        ...pageData(page, slug),
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/rera/services");
    if (slug) revalidatePath(`/rera/services/${slug}`);
    revalidatePath("/admin/rera/services");
    revalidatePath(`/admin/rera/services/${id}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update RERA service:", error);
    return { success: false, error: "Failed to update service in database." };
  }
}

function normalizeSlug(value: string | null | undefined) {
  return value?.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || null;
}

function pageData(page: Omit<import("./schema").ReraServiceInput, "id" | "title" | "description" | "iconKey" | "highlights" | "sortOrder" | "isPublished">, slug: string | null) {
  return {
    slug,
    shortDescription: page.shortDescription || null,
    pageHeading: page.pageHeading || null,
    bannerImageUrl: page.bannerImageUrl || null,
    bannerImagePublicId: page.bannerImagePublicId || null,
    bannerImageAlt: page.bannerImageAlt || null,
    contentImages: page.contentImages === undefined ? Prisma.DbNull : page.contentImages as Prisma.InputJsonValue,
    sections: page.sections === undefined ? Prisma.DbNull : page.sections as Prisma.InputJsonValue,
    ctaText: page.ctaText || null,
    ctaUrl: page.ctaUrl || null,
  };
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraService.delete({
      where: { id },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/services");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete RERA service:", error);
    return { success: false, error: "Failed to delete service." };
  }
}

export async function toggleServicePublish(id: string, isPublished: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraService.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/services");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle RERA service publish status:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}

