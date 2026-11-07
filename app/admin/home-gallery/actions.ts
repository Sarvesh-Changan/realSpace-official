"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const homeGalleryImageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  altText: z.string().optional().or(z.literal("")),
  url: z.string().url("Valid image URL is required"),
  cloudinaryId: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export type HomeGalleryImageInput = z.infer<typeof homeGalleryImageSchema>;

export async function getHomeGalleryImagesAction() {
  try {
    const images = await prisma.homeGalleryImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return { success: true, images };
  } catch (error) {
    console.error("Failed to fetch home gallery images:", error);
    return { success: false, images: [], error: "Failed to load home gallery images." };
  }
}

export async function createHomeGalleryImagesAction(rawItems: HomeGalleryImageInput[]) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  if (!rawItems || rawItems.length === 0) {
    return { success: false, error: "No images provided for upload." };
  }

  try {
    // 1. Check existing count limit (Max 15 images total)
    const existingCount = await prisma.homeGalleryImage.count();
    if (existingCount + rawItems.length > 15) {
      const allowed = Math.max(0, 15 - existingCount);
      return {
        success: false,
        error: `Maximum 15 images allowed in Home Gallery. You currently have ${existingCount} images and can add at most ${allowed} more.`,
      };
    }

    // 2. Validate input items
    const validatedItems: HomeGalleryImageInput[] = [];
    for (const rawItem of rawItems) {
      const parsed = homeGalleryImageSchema.safeParse(rawItem);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
        return { success: false, error: `Invalid image data: ${errorMsg}` };
      }
      validatedItems.push(parsed.data);
    }

    // 3. Create items in transaction
    const createdImages = await prisma.$transaction(
      validatedItems.map((item, idx) =>
        prisma.homeGalleryImage.create({
          data: {
            title: item.title,
            altText: item.altText || item.title,
            url: item.url,
            cloudinaryId: item.cloudinaryId || null,
            sortOrder: item.sortOrder ?? (existingCount + idx),
            isPublished: item.isPublished,
          },
        })
      )
    );

    revalidatePath("/admin/home-gallery");
    revalidatePath("/", "layout");

    return { success: true, count: createdImages.length, createdImages };
  } catch (error) {
    console.error("Failed to create home gallery images:", error);
    return { success: false, error: "Failed to save home gallery images." };
  }
}

export async function updateHomeGalleryImageAction(
  id: string,
  data: Partial<HomeGalleryImageInput>
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const existing = await prisma.homeGalleryImage.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Image not found." };
    }

    await prisma.homeGalleryImage.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : existing.title,
        altText: data.altText !== undefined ? data.altText : existing.altText,
        url: data.url !== undefined ? data.url : existing.url,
        cloudinaryId: data.cloudinaryId !== undefined ? data.cloudinaryId : existing.cloudinaryId,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
        isPublished: data.isPublished !== undefined ? data.isPublished : existing.isPublished,
      },
    });

    revalidatePath("/admin/home-gallery");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update home gallery image:", error);
    return { success: false, error: "Failed to update image." };
  }
}

export async function deleteHomeGalleryImageAction(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.homeGalleryImage.delete({
      where: { id },
    });

    revalidatePath("/admin/home-gallery");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete home gallery image:", error);
    return { success: false, error: "Failed to delete image." };
  }
}

export async function reorderHomeGalleryImagesAction(
  items: Array<{ id: string; sortOrder: number }>
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.homeGalleryImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidatePath("/admin/home-gallery");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder home gallery images:", error);
    return { success: false, error: "Failed to save image order." };
  }
}
