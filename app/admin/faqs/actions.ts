"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { faqSchema, type FaqFormValues } from "./schema";

export async function createFaq(data: FaqFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = faqSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid FAQ data." };
  }

  const faqData = parsed.data;

  try {
    const faq = await prisma.fAQ.create({
      data: {
        question: faqData.question,
        answer: faqData.answer,
        sortOrder: faqData.sortOrder,
        isPublished: faqData.isPublished,
      },
    });

    revalidatePath("/admin/faqs");
    revalidatePath("/faq");
    revalidatePath("/");
    return { success: true, id: faq.id };
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return { success: false, error: "Failed to create FAQ in database." };
  }
}

export async function updateFaq(id: string, data: FaqFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = faqSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid FAQ data." };
  }

  const faqData = parsed.data;

  try {
    await prisma.fAQ.update({
      where: { id },
      data: {
        question: faqData.question,
        answer: faqData.answer,
        sortOrder: faqData.sortOrder,
        isPublished: faqData.isPublished,
      },
    });

    revalidatePath("/admin/faqs");
    revalidatePath(`/admin/faqs/${id}`);
    revalidatePath("/faq");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update FAQ:", error);
    return { success: false, error: "Failed to update FAQ in database." };
  }
}

export async function deleteFaq(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.fAQ.delete({
      where: { id },
    });

    revalidatePath("/admin/faqs");
    revalidatePath("/faq");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return { success: false, error: "Failed to delete FAQ." };
  }
}

export async function toggleFaqPublish(id: string, isPublished: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.fAQ.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/admin/faqs");
    revalidatePath("/faq");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle FAQ publish:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}

export async function reorderFaq(id: string, direction: "up" | "down") {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const allFaqs = await prisma.fAQ.findMany({
      orderBy: { sortOrder: "asc" },
    });

    const currentIndex = allFaqs.findIndex((f) => f.id === id);
    if (currentIndex === -1) {
      return { success: false, error: "FAQ not found." };
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= allFaqs.length) {
      return { success: true };
    }

    const currentFaq = allFaqs[currentIndex];
    const targetFaq = allFaqs[targetIndex];

    await prisma.$transaction([
      prisma.fAQ.update({
        where: { id: currentFaq.id },
        data: { sortOrder: targetFaq.sortOrder },
      }),
      prisma.fAQ.update({
        where: { id: targetFaq.id },
        data: { sortOrder: currentFaq.sortOrder },
      }),
    ]);

    revalidatePath("/admin/faqs");
    revalidatePath("/faq");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder FAQ:", error);
    return { success: false, error: "Failed to reorder FAQ." };
  }
}

export async function updateFaqSortOrder(id: string, newOrder: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.fAQ.update({
      where: { id },
      data: { sortOrder: newOrder },
    });

    revalidatePath("/admin/faqs");
    revalidatePath("/faq");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update FAQ sort order:", error);
    return { success: false, error: "Failed to update sort order." };
  }
}
