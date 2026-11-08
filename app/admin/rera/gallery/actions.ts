"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import {
  bulkGalleryCreateSchema,
  reraGalleryItemSchema,
  type BulkGalleryCreateInput,
  type ReraGalleryItemInput,
} from "./schema";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function destroyCloudinaryAsset(
  publicId: string | null | undefined,
  resourceType: "image" | "video" = "image"
) {
  if (!publicId || publicId.startsWith("temp-") || publicId.startsWith("img-")) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete Cloudinary ${resourceType} asset (${publicId}):`, error);
  }
}

export async function createBulkGalleryItems(
  data: BulkGalleryCreateInput
): Promise<{ success: boolean; count?: number; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = bulkGalleryCreateSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid gallery data." };
  }

  const { title, category, sortOrder, isPublished, items } = parsed.data;

  try {
    const created = await prisma.$transaction(
      items.map((item, idx) =>
        prisma.reraGalleryItem.create({
          data: {
            title,
            category,
            mediaType: item.mediaType,
            url: item.url,
            publicId: item.publicId || null,
            thumbnailUrl: item.thumbnailUrl || null,
            thumbnailPublicId: item.thumbnailPublicId || null,
            fileSizeBytes: item.fileSizeBytes ?? null,
            cloudinaryEtag: item.cloudinaryEtag || null,
            sortOrder: sortOrder + idx,
            isPublished,
          },
        })
      ),
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/gallery");

    return { success: true, count: created.length };
  } catch (error) {
    console.error("Failed to create bulk gallery items:", error);
    return { success: false, error: "Failed to create gallery items in database." };
  }
}

export async function updateGalleryItem(
  id: string,
  data: ReraGalleryItemInput
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraGalleryItemSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid gallery data." };
  }

  const {
    title,
    category,
    mediaType,
    url,
    publicId,
    thumbnailUrl,
    thumbnailPublicId,
    fileSizeBytes,
    cloudinaryEtag,
    sortOrder,
    isPublished,
  } = parsed.data;

  try {
    const existing = await prisma.reraGalleryItem.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Gallery item not found." };
    }

    // If media asset replaced, clean up old asset
    if (existing.publicId && publicId && existing.publicId !== publicId) {
      await destroyCloudinaryAsset(existing.publicId, existing.mediaType === "VIDEO" ? "video" : "image");
    }
    // If thumbnail asset replaced, clean up old thumbnail
    if (existing.thumbnailPublicId && thumbnailPublicId && existing.thumbnailPublicId !== thumbnailPublicId) {
      await destroyCloudinaryAsset(existing.thumbnailPublicId, "image");
    }

    await prisma.reraGalleryItem.update({
      where: { id },
      data: {
        title,
        category,
        mediaType,
        url,
        publicId: publicId || null,
        thumbnailUrl: thumbnailUrl || null,
        thumbnailPublicId: thumbnailPublicId || null,
        fileSizeBytes: fileSizeBytes ?? null,
        cloudinaryEtag: cloudinaryEtag || null,
        sortOrder,
        isPublished,
      },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/gallery");
    revalidatePath(`/admin/rera/gallery/${id}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update gallery item:", error);
    return { success: false, error: "Failed to update gallery item in database." };
  }
}

export async function deleteGalleryItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const existing = await prisma.reraGalleryItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Gallery item not found." };
    }

    await prisma.reraGalleryItem.delete({
      where: { id },
    });

    // Destroy main Cloudinary asset
    if (existing.publicId) {
      await destroyCloudinaryAsset(
        existing.publicId,
        existing.mediaType === "VIDEO" ? "video" : "image"
      );
    }

    // Destroy video thumbnail asset if present
    if (existing.thumbnailPublicId) {
      await destroyCloudinaryAsset(existing.thumbnailPublicId, "image");
    }

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/gallery");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete gallery item:", error);
    return { success: false, error: "Failed to delete gallery item." };
  }
}

export async function toggleGalleryItemPublish(
  id: string,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraGalleryItem.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/gallery");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle gallery item publish status:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}

