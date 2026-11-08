"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { reraFaqSchema, type ReraFaqInput } from "./schema";

export async function createFaq(data: ReraFaqInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraFaqSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid FAQ data." };
  }

  const { question, answer, sortOrder, isPublished } = parsed.data;

  try {
    const faq = await prisma.reraFaq.create({
      data: {
        question,
        answer,
        sortOrder,
        isPublished,
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/faqs");

    return { success: true, id: faq.id };
  } catch (error) {
    console.error("Failed to create RERA FAQ:", error);
    return { success: false, error: "Failed to create FAQ in database." };
  }
}

export async function updateFaq(id: string, data: ReraFaqInput): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraFaqSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid FAQ data." };
  }

  const { question, answer, sortOrder, isPublished } = parsed.data;

  try {
    await prisma.reraFaq.update({
      where: { id },
      data: {
        question,
        answer,
        sortOrder,
        isPublished,
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/faqs");
    revalidatePath(`/admin/rera/faqs/${id}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update RERA FAQ:", error);
    return { success: false, error: "Failed to update FAQ in database." };
  }
}

export async function deleteFaq(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraFaq.delete({
      where: { id },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/faqs");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete RERA FAQ:", error);
    return { success: false, error: "Failed to delete FAQ." };
  }
}

export async function toggleFaqPublish(id: string, isPublished: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraFaq.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/faqs");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle FAQ publish status:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}

