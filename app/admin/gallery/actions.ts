"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { categorySchema, imageSchema, type CategoryInput, type ImageInput } from "./schema";

// --- Category Server Actions ---

export async function createCategory(data: CategoryInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid category data." };
  }

  try {
    const category = await prisma.galleryCategory.create({
      data: {
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { success: true, id: category.id };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    if (error.code === "P2002") {
      return { success: false, error: "A category with this name already exists." };
    }
    return { success: false, error: "Failed to create category in database." };
  }
}

export async function updateCategory(id: string, data: CategoryInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid category data." };
  }

  try {
    await prisma.galleryCategory.update({
      where: { id },
      data: {
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update category:", error);
    if (error.code === "P2002") {
      return { success: false, error: "A category with this name already exists." };
    }
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.galleryCategory.delete({
      where: { id },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category." };
  }
}

// --- Image Server Actions ---

export async function createImage(data: ImageInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = imageSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid image data." };
  }

  try {
    const imgData = parsed.data;

    if (imgData.isCategoryCover) {
      // Unset isCategoryCover on all other images in this category
      await prisma.galleryImage.updateMany({
        where: { categoryId: imgData.categoryId },
        data: { isCategoryCover: false },
      });
    }

    const image = await prisma.galleryImage.create({
      data: {
        title: imgData.title,
        categoryId: imgData.categoryId,
        designType: imgData.designType,
        mediaType: imgData.mediaType,
        url: imgData.url,
        cloudinaryId: imgData.cloudinaryId || imgData.url,
        fileSizeBytes: imgData.fileSizeBytes ?? null,
        cloudinaryEtag: imgData.cloudinaryEtag ?? null,
        isCategoryCover: imgData.isCategoryCover,
        isFeatured: imgData.isFeatured,
        isPublished: imgData.isPublished,
        sortOrder: imgData.sortOrder,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { success: true, id: image.id };
  } catch (error) {
    console.error("Failed to create gallery image:", error);
    return { success: false, error: "Failed to create gallery image." };
  }
}

export async function createBulkImages(items: ImageInput[]) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  if (!items || items.length === 0) {
    return { success: false, error: "No images provided for bulk creation." };
  }

  const validatedItems: ImageInput[] = [];
  for (const item of items) {
    const parsed = imageSchema.safeParse(item);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg || "Invalid image data in batch." };
    }
    validatedItems.push(parsed.data);
  }

  try {
    const categoryId = validatedItems[0].categoryId;
    const hasCategoryCover = validatedItems.some((item) => item.isCategoryCover);

    // If any item in the batch is set as category cover, unset isCategoryCover on existing images
    if (hasCategoryCover) {
      await prisma.galleryImage.updateMany({
        where: { categoryId },
        data: { isCategoryCover: false },
      });
    }

    // Ensure isCategoryCover is true ONLY for the first file in the batch if requested
    let coverAssigned = false;
    const finalData = validatedItems.map((item) => {
      let isCover = item.isCategoryCover;
      if (isCover) {
        if (coverAssigned) {
          isCover = false;
        } else {
          coverAssigned = true;
        }
      }
      return {
        title: item.title,
        categoryId: item.categoryId,
        designType: item.designType,
        mediaType: item.mediaType,
        url: item.url,
        cloudinaryId: item.cloudinaryId || item.url,
        fileSizeBytes: item.fileSizeBytes ?? null,
        cloudinaryEtag: item.cloudinaryEtag ?? null,
        isCategoryCover: isCover,
        isFeatured: item.isFeatured,
        isPublished: item.isPublished,
        sortOrder: item.sortOrder,
      };
    });

    await prisma.$transaction(
      finalData.map((data) => prisma.galleryImage.create({ data }))
    );

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/projects");
    revalidatePath("/", "layout");

    return { success: true, count: finalData.length };
  } catch (error) {
    console.error("Failed to create bulk gallery images:", error);
    return { success: false, error: "Failed to create gallery images batch in database." };
  }
}


export async function updateImage(id: string, data: ImageInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = imageSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid image data." };
  }

  try {
    const imgData = parsed.data;

    if (imgData.isCategoryCover) {
      // Automatically set isCategoryCover to false on every OTHER row in the category
      await prisma.galleryImage.updateMany({
        where: {
          categoryId: imgData.categoryId,
          id: { not: id },
        },
        data: { isCategoryCover: false },
      });
    }

    await prisma.galleryImage.update({
      where: { id },
      data: {
        title: imgData.title,
        categoryId: imgData.categoryId,
        designType: imgData.designType,
        mediaType: imgData.mediaType,
        url: imgData.url,
        cloudinaryId: imgData.cloudinaryId || imgData.url,
        fileSizeBytes: imgData.fileSizeBytes ?? undefined,
        cloudinaryEtag: imgData.cloudinaryEtag ?? undefined,
        isCategoryCover: imgData.isCategoryCover,
        isFeatured: imgData.isFeatured,
        isPublished: imgData.isPublished,
        sortOrder: imgData.sortOrder,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${id}`);
    revalidatePath("/gallery");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update gallery image:", error);
    return { success: false, error: "Failed to update gallery image." };
  }
}

export async function deleteImage(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.galleryImage.delete({
      where: { id },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete gallery image:", error);
    return { success: false, error: "Failed to delete gallery image." };
  }
}

export async function toggleImageStatus(
  id: string,
  field: "isFeatured" | "isPublished" | "isCategoryCover",
  value: boolean
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Image not found." };
    }

    if (field === "isCategoryCover" && value === true) {
      await prisma.galleryImage.updateMany({
        where: { categoryId: existing.categoryId, id: { not: id } },
        data: { isCategoryCover: false },
      });
    }

    await prisma.galleryImage.update({
      where: { id },
      data: {
        [field]: value,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error(`Failed to toggle ${field} for gallery image:`, error);
    return { success: false, error: `Failed to update ${field} status.` };
  }
}

function extractCloudinaryPublicId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  if (!urlOrId.includes("res.cloudinary.com") && !urlOrId.startsWith("http://") && !urlOrId.startsWith("https://")) {
    return urlOrId;
  }
  const match = urlOrId.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match?.[1] || null;
}

async function processSingleImageMetadata(img: any) {
  let bytes: number | null = img.fileSizeBytes;
  let etag: string | null = img.cloudinaryEtag;

  const publicId = extractCloudinaryPublicId(img.cloudinaryId) || extractCloudinaryPublicId(img.url);

  // 1. Try CDN HTTP Range request with 3s timeout (zero Admin API ops)
  if ((bytes === null || etag === null) && img.url) {
    try {
      const rangeRes = await fetch(img.url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal: AbortSignal.timeout(3000),
      });
      if (rangeRes.ok || rangeRes.status === 206) {
        const contentRange = rangeRes.headers.get("content-range");
        if (contentRange) {
          const totalMatch = contentRange.match(/\/(\d+)$/);
          if (totalMatch) bytes = parseInt(totalMatch[1], 10);
        }
        if (bytes === null) {
          const cl = rangeRes.headers.get("content-length");
          if (cl && !isNaN(Number(cl)) && Number(cl) > 1) bytes = Number(cl);
        }
        const headerEtag = rangeRes.headers.get("etag");
        if (headerEtag) {
          etag = headerEtag.replace(/^W\/"|^"|"$/g, "");
        }
      }
    } catch {
      // Ignore timeout/fetch errors
    }
  }

  // 2. Fallback to standard HEAD request with 2s timeout if bytes or etag still missing
  if ((bytes === null || etag === null) && img.url) {
    try {
      const headRes = await fetch(img.url, {
        method: "HEAD",
        signal: AbortSignal.timeout(2000),
      });
      if (headRes.ok) {
        if (bytes === null) {
          const cl = headRes.headers.get("content-length");
          if (cl && !isNaN(Number(cl))) bytes = Number(cl);
        }
        if (etag === null) {
          const headerEtag = headRes.headers.get("etag");
          if (headerEtag) etag = headerEtag.replace(/^W\/"|^"|"$/g, "");
        }
      }
    } catch {
      // Ignore timeout/fetch errors
    }
  }

  return { bytes, etag, publicId };
}

export async function syncGalleryMediaSizes() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const unindexedImages = await prisma.galleryImage.findMany({
      where: {
        OR: [
          { fileSizeBytes: null },
          { cloudinaryEtag: null },
        ],
      },
    });

    if (unindexedImages.length === 0) {
      return { success: true, updatedCount: 0, message: "All gallery media already have size metadata." };
    }

    const itemsToProcess = unindexedImages.slice(0, 30);
    const BATCH_SIZE = 10;
    let updatedCount = 0;

    for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
      const chunk = itemsToProcess.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        chunk.map(async (img) => {
          const meta = await processSingleImageMetadata(img);
          if (meta.bytes !== null || meta.etag !== null || (meta.publicId && meta.publicId !== img.cloudinaryId)) {
            await prisma.galleryImage.update({
              where: { id: img.id },
              data: {
                fileSizeBytes: meta.bytes,
                cloudinaryEtag: meta.etag,
                ...(meta.publicId && meta.publicId !== img.cloudinaryId ? { cloudinaryId: meta.publicId } : {}),
              },
            });
            return true;
          }
          return false;
        })
      );

      for (const res of results) {
        if (res.status === "fulfilled" && res.value) {
          updatedCount++;
        }
      }
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return {
      success: true,
      updatedCount,
      totalLegacy: unindexedImages.length,
      message: `Successfully updated size & etag metadata for ${updatedCount} media file(s).`,
    };
  } catch (error) {
    console.error("Failed to sync legacy gallery metadata:", error);
    return { success: false, error: "Failed to sync legacy media metadata." };
  }
}

