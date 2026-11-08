"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { reraTestimonialSchema, type ReraTestimonialInput } from "./schema";

export async function createTestimonial(data: ReraTestimonialInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraTestimonialSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid testimonial data." };
  }

  const { authorName, authorRole, society, quote, rating, sortOrder, isPublished } = parsed.data;

  try {
    const testimonial = await prisma.reraTestimonial.create({
      data: {
        authorName,
        authorRole: authorRole && authorRole.trim() !== "" ? authorRole.trim() : null,
        society: society && society.trim() !== "" ? society.trim() : null,
        quote,
        rating,
        sortOrder,
        isPublished,
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/testimonials");

    return { success: true, id: testimonial.id };
  } catch (error) {
    console.error("Failed to create RERA testimonial:", error);
    return { success: false, error: "Failed to create testimonial in database." };
  }
}

export async function updateTestimonial(id: string, data: ReraTestimonialInput): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraTestimonialSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid testimonial data." };
  }

  const { authorName, authorRole, society, quote, rating, sortOrder, isPublished } = parsed.data;

  try {
    await prisma.reraTestimonial.update({
      where: { id },
      data: {
        authorName,
        authorRole: authorRole && authorRole.trim() !== "" ? authorRole.trim() : null,
        society: society && society.trim() !== "" ? society.trim() : null,
        quote,
        rating,
        sortOrder,
        isPublished,
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/testimonials");
    revalidatePath(`/admin/rera/testimonials/${id}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update RERA testimonial:", error);
    return { success: false, error: "Failed to update testimonial in database." };
  }
}

export async function deleteTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraTestimonial.delete({
      where: { id },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/testimonials");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete RERA testimonial:", error);
    return { success: false, error: "Failed to delete testimonial." };
  }
}

export async function toggleTestimonialPublish(id: string, isPublished: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraTestimonial.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/testimonials");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle testimonial publish status:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}

