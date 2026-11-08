"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import {
  reraPropertySchema,
  type ReraPropertyInput,
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

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createProperty(data: ReraPropertyInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraPropertySchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid property data." };
  }

  const propertyData = parsed.data;
  let baseSlug = propertyData.slug ? generateSlug(propertyData.slug) : generateSlug(propertyData.title);
  if (!baseSlug) baseSlug = `property-${Date.now()}`;
  let slug = baseSlug;

  // Slug collision check
  let counter = 1;
  while (true) {
    const existing = await prisma.reraProperty.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Cover image fallback to first image if not explicitly set
  let coverImageUrl = propertyData.coverImageUrl || null;
  let coverImagePublicId = propertyData.coverImagePublicId || null;
  if (!coverImageUrl && propertyData.images.length > 0) {
    coverImageUrl = propertyData.images[0].url;
    coverImagePublicId = propertyData.images[0].publicId || null;
  }

  try {
    const property = await prisma.$transaction(
      async (tx) => {
        return tx.reraProperty.create({
          data: {
            title: propertyData.title,
            slug,
            listingType: propertyData.listingType,
            propertyType: propertyData.propertyType,
            bhkLabel: propertyData.bhkLabel || null,
            priceLabel: propertyData.priceLabel,
            priceAmount: propertyData.priceAmount ?? null,
            carpetAreaSqFt: propertyData.carpetAreaSqFt ?? null,
            builtUpAreaSqFt: propertyData.builtUpAreaSqFt ?? null,
            furnishing: propertyData.furnishing || null,
            locality: propertyData.locality,
            city: propertyData.city || "Thane",
            projectName: propertyData.projectName || null,
            builderName: propertyData.builderName || null,
            projectReraNo: propertyData.projectReraNo || null,
            possession: propertyData.possession || null,
            description: propertyData.description || null,
            coverImageUrl,
            coverImagePublicId,
            isFeatured: propertyData.isFeatured,
            isNewLaunch: propertyData.isNewLaunch,
            isPublished: propertyData.isPublished,
            sortOrder: propertyData.sortOrder,
            amenities: propertyData.amenities,
            specifications: propertyData.specifications,
            images: {
              create: propertyData.images.map((img, idx) => ({
                url: img.url,
                publicId: img.publicId || null,
                mediaType: img.mediaType,
                altText: img.altText || (img.mediaType === "VIDEO" ? "Property video" : propertyData.title),
                sortOrder: img.sortOrder ?? idx,
              })),
            },
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/properties");

    return { success: true, id: property.id };
  } catch (error) {
    console.error("Failed to create property:", error);
    return { success: false, error: "Failed to create property in database." };
  }
}

export async function updateProperty(id: string, data: ReraPropertyInput): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = reraPropertySchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid property data." };
  }

  const propertyData = parsed.data;
  let baseSlug = propertyData.slug ? generateSlug(propertyData.slug) : generateSlug(propertyData.title);
  if (!baseSlug) baseSlug = `property-${Date.now()}`;
  let slug = baseSlug;

  // Slug collision check (excluding current property)
  let counter = 1;
  while (true) {
    const existing = await prisma.reraProperty.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  let coverImageUrl = propertyData.coverImageUrl || null;
  let coverImagePublicId = propertyData.coverImagePublicId || null;
  if (!coverImageUrl && propertyData.images.length > 0) {
    coverImageUrl = propertyData.images[0].url;
    coverImagePublicId = propertyData.images[0].publicId || null;
  }

  try {
    const existingProperty = await prisma.reraProperty.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProperty) {
      return { success: false, error: "Property not found." };
    }

    await prisma.$transaction(
      async (tx) => {
        // 1. Delete previous images
        await tx.reraPropertyImage.deleteMany({
          where: { propertyId: id },
        });

        // 2. Update property and recreate images
        await tx.reraProperty.update({
          where: { id },
          data: {
            title: propertyData.title,
            slug,
            listingType: propertyData.listingType,
            propertyType: propertyData.propertyType,
            bhkLabel: propertyData.bhkLabel || null,
            priceLabel: propertyData.priceLabel,
            priceAmount: propertyData.priceAmount ?? null,
            carpetAreaSqFt: propertyData.carpetAreaSqFt ?? null,
            builtUpAreaSqFt: propertyData.builtUpAreaSqFt ?? null,
            furnishing: propertyData.furnishing || null,
            locality: propertyData.locality,
            city: propertyData.city || "Thane",
            projectName: propertyData.projectName || null,
            builderName: propertyData.builderName || null,
            projectReraNo: propertyData.projectReraNo || null,
            possession: propertyData.possession || null,
            description: propertyData.description || null,
            coverImageUrl,
            coverImagePublicId,
            isFeatured: propertyData.isFeatured,
            isNewLaunch: propertyData.isNewLaunch,
            isPublished: propertyData.isPublished,
            sortOrder: propertyData.sortOrder,
            amenities: propertyData.amenities,
            specifications: propertyData.specifications,
            images: {
              create: propertyData.images.map((img, idx) => ({
                url: img.url,
                publicId: img.publicId || null,
                mediaType: img.mediaType,
                altText: img.altText || (img.mediaType === "VIDEO" ? "Property video" : propertyData.title),
                sortOrder: img.sortOrder ?? idx,
              })),
            },
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    // 3. Clean up removed Cloudinary assets asynchronously
    const newPublicIds = new Set<string>();
    if (coverImagePublicId) newPublicIds.add(coverImagePublicId);
    propertyData.images.forEach((img) => {
      if (img.publicId) newPublicIds.add(img.publicId);
    });

    if (existingProperty.coverImagePublicId && !newPublicIds.has(existingProperty.coverImagePublicId)) {
      await destroyCloudinaryAsset(existingProperty.coverImagePublicId, "image");
    }

    for (const oldImg of existingProperty.images) {
      if (oldImg.publicId && !newPublicIds.has(oldImg.publicId)) {
        await destroyCloudinaryAsset(oldImg.publicId, oldImg.mediaType === "VIDEO" ? "video" : "image");
      }
    }

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/properties");
    revalidatePath(`/admin/rera/properties/${id}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update property:", error);
    return { success: false, error: "Failed to update property in database." };
  }
}

export async function deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const existing = await prisma.reraProperty.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existing) {
      return { success: false, error: "Property not found." };
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.reraPropertyImage.deleteMany({ where: { propertyId: id } });
        await tx.reraProperty.delete({ where: { id } });
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    // Clean up all Cloudinary assets
    if (existing.coverImagePublicId) {
      await destroyCloudinaryAsset(existing.coverImagePublicId, "image");
    }
    for (const img of existing.images) {
      if (img.publicId) {
        await destroyCloudinaryAsset(img.publicId, img.mediaType === "VIDEO" ? "video" : "image");
      }
    }

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/properties");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete property:", error);
    return { success: false, error: "Failed to delete property." };
  }
}

export async function togglePropertyPublished(id: string, isPublished: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraProperty.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/properties");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle publish status:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}

export async function togglePropertyFeatured(id: string, isFeatured: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraProperty.update({
      where: { id },
      data: { isFeatured },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/properties");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle featured status:", error);
    return { success: false, error: "Failed to update featured state." };
  }
}

export async function togglePropertyNewLaunch(id: string, isNewLaunch: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.reraProperty.update({
      where: { id },
      data: { isNewLaunch },
    });

    revalidatePath("/rera", "layout");
    revalidatePath("/admin/rera/properties");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle new launch status:", error);
    return { success: false, error: "Failed to update new launch state." };
  }
}

