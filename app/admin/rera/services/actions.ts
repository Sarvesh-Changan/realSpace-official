"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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

  const { title, description, iconKey, highlights, sortOrder, isPublished } = parsed.data;

  try {
    const service = await prisma.reraService.create({
      data: {
        title,
        description,
        iconKey: iconKey && iconKey.trim() !== "" ? iconKey.trim() : null,
        highlights,
        sortOrder,
        isPublished,
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

  const { title, description, iconKey, highlights, sortOrder, isPublished } = parsed.data;

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
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/services");
    revalidatePath(`/admin/rera/services/${id}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update RERA service:", error);
    return { success: false, error: "Failed to update service in database." };
  }
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

