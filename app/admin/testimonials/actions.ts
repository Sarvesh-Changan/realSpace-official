"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { TestimonialFormValues } from "./_components/TestimonialForm";

export const testimonialSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientRole: z.string().optional().nullable(),
  quote: z.string().min(1, "Quote is required"),
  projectType: z.string().optional().nullable(),
  rating: z.coerce.number().min(1).max(5).default(5),
  sortOrder: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
});

export async function createTestimonial(data: TestimonialFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid testimonial data." };
  }

  const testimonialData = parsed.data;

  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: testimonialData.clientName,
        clientRole: testimonialData.clientRole || null,
        quote: testimonialData.quote,
        projectType: testimonialData.projectType || null,
        rating: testimonialData.rating,
        sortOrder: testimonialData.sortOrder,
        isPublished: testimonialData.isPublished,
      },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true, id: testimonial.id };
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return { success: false, error: "Failed to create testimonial in database." };
  }
}

export async function updateTestimonial(id: string, data: TestimonialFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid testimonial data." };
  }

  const testimonialData = parsed.data;

  try {
    await prisma.testimonial.update({
      where: { id },
      data: {
        clientName: testimonialData.clientName,
        clientRole: testimonialData.clientRole || null,
        quote: testimonialData.quote,
        projectType: testimonialData.projectType || null,
        rating: testimonialData.rating,
        sortOrder: testimonialData.sortOrder,
        isPublished: testimonialData.isPublished,
      },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath(`/admin/testimonials/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return { success: false, error: "Failed to update testimonial in database." };
  }
}

export async function deleteTestimonial(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.testimonial.delete({
      where: { id },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return { success: false, error: "Failed to delete testimonial." };
  }
}

export async function toggleTestimonialPublish(id: string, isPublished: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.testimonial.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle testimonial publish:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}
