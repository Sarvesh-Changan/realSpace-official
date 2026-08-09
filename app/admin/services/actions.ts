"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ServiceFormValues } from "./_components/ServiceForm";

export const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  designType: z.enum(["INTERIOR", "EXTERIOR"]),
  description: z.string().min(1, "Description is required"),
  iconKey: z.string().optional().nullable(),
  sortOrder: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
});

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createService(data: ServiceFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid service data." };
  }

  const serviceData = parsed.data;
  let slug = serviceData.slug ? generateSlug(serviceData.slug) : generateSlug(serviceData.title);

  // Ensure slug uniqueness
  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    const service = await prisma.service.create({
      data: {
        title: serviceData.title,
        slug,
        designType: serviceData.designType,
        description: serviceData.description,
        iconKey: serviceData.iconKey || null,
        sortOrder: serviceData.sortOrder,
        isPublished: serviceData.isPublished,
      },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");
    return { success: true, id: service.id };
  } catch (error) {
    console.error("Failed to create service:", error);
    return { success: false, error: "Failed to create service in database." };
  }
}

export async function updateService(id: string, data: ServiceFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid service data." };
  }

  const serviceData = parsed.data;
  let slug = serviceData.slug ? generateSlug(serviceData.slug) : generateSlug(serviceData.title);

  // Ensure slug uniqueness excluding current service
  const existingSlug = await prisma.service.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    await prisma.service.update({
      where: { id },
      data: {
        title: serviceData.title,
        slug,
        designType: serviceData.designType,
        description: serviceData.description,
        iconKey: serviceData.iconKey || null,
        sortOrder: serviceData.sortOrder,
        isPublished: serviceData.isPublished,
      },
    });

    revalidatePath("/admin/services");
    revalidatePath(`/admin/services/${id}`);
    revalidatePath("/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to update service:", error);
    return { success: false, error: "Failed to update service in database." };
  }
}

export async function deleteService(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.service.delete({
      where: { id },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete service:", error);
    return { success: false, error: "Failed to delete service." };
  }
}

export async function toggleServicePublish(id: string, isPublished: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.service.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle service publish:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}
