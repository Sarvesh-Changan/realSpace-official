"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { reraBranchSchema, type ReraBranchInput } from "./schema";

export async function createBranch(data: ReraBranchInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraBranchSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid branch data." };
  }

  const { name, address, phone, mapUrl, sortOrder, isPublished } = parsed.data;

  try {
    const branch = await prisma.reraBranch.create({
      data: {
        name,
        address,
        phone: phone && phone.trim() !== "" ? phone.trim() : null,
        mapUrl: mapUrl && mapUrl.trim() !== "" ? mapUrl.trim() : null,
        sortOrder,
        isPublished,
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/branches");

    return { success: true, id: branch.id };
  } catch (error) {
    console.error("Failed to create RERA branch:", error);
    return { success: false, error: "Failed to create branch in database." };
  }
}

export async function updateBranch(id: string, data: ReraBranchInput): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraBranchSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid branch data." };
  }

  const { name, address, phone, mapUrl, sortOrder, isPublished } = parsed.data;

  try {
    await prisma.reraBranch.update({
      where: { id },
      data: {
        name,
        address,
        phone: phone && phone.trim() !== "" ? phone.trim() : null,
        mapUrl: mapUrl && mapUrl.trim() !== "" ? mapUrl.trim() : null,
        sortOrder,
        isPublished,
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/branches");
    revalidatePath(`/admin/rera/branches/${id}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update RERA branch:", error);
    return { success: false, error: "Failed to update branch in database." };
  }
}

export async function deleteBranch(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraBranch.delete({
      where: { id },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/branches");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete RERA branch:", error);
    return { success: false, error: "Failed to delete branch." };
  }
}

export async function toggleBranchPublish(id: string, isPublished: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraBranch.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/branches");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle branch publish status:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}

