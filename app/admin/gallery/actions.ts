"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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
    revalidatePath("/projects");
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
    revalidatePath("/projects");
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
    revalidatePath("/projects");
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
    const image = await prisma.galleryImage.create({
      data: {
        title: imgData.title,
        categoryId: imgData.categoryId,
        designType: imgData.designType,
        mediaType: imgData.mediaType,
        url: imgData.url,
        cloudinaryId: imgData.cloudinaryId || imgData.url,
        theme: imgData.theme || null,
        approxBudgetLabel: imgData.approxBudgetLabel || null,
        description: imgData.description || null,
        isFeatured: imgData.isFeatured,
        isPublished: imgData.isPublished,
        sortOrder: imgData.sortOrder,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/projects");
    return { success: true, id: image.id };
  } catch (error) {
    console.error("Failed to create gallery image:", error);
    return { success: false, error: "Failed to create gallery image." };
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
    await prisma.galleryImage.update({
      where: { id },
      data: {
        title: imgData.title,
        categoryId: imgData.categoryId,
        designType: imgData.designType,
        mediaType: imgData.mediaType,
        url: imgData.url,
        cloudinaryId: imgData.cloudinaryId || imgData.url,
        theme: imgData.theme || null,
        approxBudgetLabel: imgData.approxBudgetLabel || null,
        description: imgData.description || null,
        isFeatured: imgData.isFeatured,
        isPublished: imgData.isPublished,
        sortOrder: imgData.sortOrder,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${id}`);
    revalidatePath("/projects");
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
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete gallery image:", error);
    return { success: false, error: "Failed to delete gallery image." };
  }
}

export async function toggleImageStatus(
  id: string,
  field: "isFeatured" | "isPublished",
  value: boolean
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.galleryImage.update({
      where: { id },
      data: {
        [field]: value,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error(`Failed to toggle ${field} for gallery image:`, error);
    return { success: false, error: `Failed to update ${field} status.` };
  }
}
