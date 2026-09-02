"use server";

import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { TestimonialFormValues } from "./_components/TestimonialForm";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const testimonialSchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required").max(200),
  clientRole: z.string().trim().max(200).optional().nullable(),
  quote: z.string().trim().min(1, "Quote is required").max(5000),
  imageUrl: z.string().trim().url("Image URL must be valid").optional().or(z.literal("")),
  imagePublicId: z.string().trim().max(500).optional().or(z.literal("")),
  imageUrls: z.array(z.string().trim().url("Image URL must be valid")).max(20).default([]),
  imagePublicIds: z.array(z.string().trim().max(500)).max(20).default([]),
  videoUrl: z.string().trim().url("Video URL must be valid").optional().or(z.literal("")),
  videoPublicId: z.string().trim().max(500).optional().or(z.literal("")),
  videoUrls: z.array(z.string().trim().url("Video URL must be valid")).max(20).default([]),
  videoPublicIds: z.array(z.string().trim().max(500)).max(20).default([]),
  thumbnailUrl: z.string().trim().url("Thumbnail URL must be valid").optional().or(z.literal("")),
  thumbnailPublicId: z.string().trim().max(500).optional().or(z.literal("")),
  slug: z.string().trim().max(200).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().nullable(),
  projectType: z.string().trim().max(200).optional().nullable(),
  rating: z.coerce.number().min(1).max(5).default(5),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
}).superRefine((data, context) => {
  const hasVideo = data.videoUrl || data.videoUrls.length > 0;
  if (hasVideo && !data.thumbnailUrl) {
    context.addIssue({ code: "custom", path: ["thumbnailUrl"], message: "A thumbnail is required when a video testimonial is provided." });
  }
});

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180) || "testimonial";
}

async function getUniqueSlug(rawSlug: string | undefined, clientName: string, excludedId?: string) {
  const requestedSlug = rawSlug?.trim();
  const baseSlug = slugify(requestedSlug || clientName);
  const existing = await prisma.testimonial.findUnique({ where: { slug: baseSlug } });

  if (!existing || existing.id === excludedId) {
    return baseSlug;
  }

  if (requestedSlug) {
    return `${baseSlug}-${Date.now().toString(36)}`;
  }

  let counter = 2;
  while (counter < 50) {
    const candidate = `${baseSlug}-${counter}`;
    const found = await prisma.testimonial.findUnique({ where: { slug: candidate } });
    if (!found || found.id === excludedId) return candidate;
    counter++;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

async function destroyCloudinaryAsset(publicId: string | null | undefined, resourceType: "image" | "video") {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete Cloudinary ${resourceType} asset:`, error);
  }
}

export async function createTestimonial(data: TestimonialFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") || "Invalid testimonial data." };
  }

  try {
    const testimonialData = parsed.data;
    const slug = await getUniqueSlug(testimonialData.slug, testimonialData.clientName);

    const imageUrls = testimonialData.imageUrls.length ? testimonialData.imageUrls : testimonialData.imageUrl ? [testimonialData.imageUrl] : [];
    const imagePublicIds = testimonialData.imagePublicIds.length ? testimonialData.imagePublicIds : testimonialData.imagePublicId ? [testimonialData.imagePublicId] : [];
    const videoUrls = testimonialData.videoUrls.length ? testimonialData.videoUrls : testimonialData.videoUrl ? [testimonialData.videoUrl] : [];
    const videoPublicIds = testimonialData.videoPublicIds.length ? testimonialData.videoPublicIds : testimonialData.videoPublicId ? [testimonialData.videoPublicId] : [];

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: testimonialData.clientName,
        clientRole: testimonialData.clientRole || null,
        quote: testimonialData.quote,
        imageUrl: imageUrls[0] || null,
        imagePublicId: imagePublicIds[0] || null,
        imageUrls,
        imagePublicIds,
        videoUrl: videoUrls[0] || null,
        videoPublicId: videoPublicIds[0] || null,
        videoUrls,
        videoPublicIds,
        thumbnailUrl: testimonialData.thumbnailUrl || null,
        thumbnailPublicId: testimonialData.thumbnailPublicId || null,
        slug,
        location: testimonialData.location || null,
        projectType: testimonialData.projectType || null,
        rating: testimonialData.rating,
        sortOrder: testimonialData.sortOrder,
        isPublished: testimonialData.isPublished,
      },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/testimonials");
    revalidatePath("/");
    return { success: true, id: testimonial.id };
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create testimonial in database." };
  }
}

export async function updateTestimonial(id: string, data: TestimonialFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") || "Invalid testimonial data." };
  }

  try {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Testimonial not found." };

    const testimonialData = parsed.data;
    const slug = await getUniqueSlug(testimonialData.slug, testimonialData.clientName, id);

    const imageUrls = testimonialData.imageUrls.length ? testimonialData.imageUrls : testimonialData.imageUrl ? [testimonialData.imageUrl] : [];
    const imagePublicIds = testimonialData.imagePublicIds.length ? testimonialData.imagePublicIds : testimonialData.imagePublicId ? [testimonialData.imagePublicId] : [];
    const videoUrls = testimonialData.videoUrls.length ? testimonialData.videoUrls : testimonialData.videoUrl ? [testimonialData.videoUrl] : [];
    const videoPublicIds = testimonialData.videoPublicIds.length ? testimonialData.videoPublicIds : testimonialData.videoPublicId ? [testimonialData.videoPublicId] : [];

    await prisma.testimonial.update({
      where: { id },
      data: {
        clientName: testimonialData.clientName,
        clientRole: testimonialData.clientRole || null,
        quote: testimonialData.quote,
        imageUrl: imageUrls[0] || null,
        imagePublicId: imagePublicIds[0] || null,
        imageUrls,
        imagePublicIds,
        videoUrl: videoUrls[0] || null,
        videoPublicId: videoPublicIds[0] || null,
        videoUrls,
        videoPublicIds,
        thumbnailUrl: testimonialData.thumbnailUrl || null,
        thumbnailPublicId: testimonialData.thumbnailPublicId || null,
        slug,
        location: testimonialData.location || null,
        projectType: testimonialData.projectType || null,
        rating: testimonialData.rating,
        sortOrder: testimonialData.sortOrder,
        isPublished: testimonialData.isPublished,
      },
    });

    if (existing.videoPublicId !== (videoPublicIds[0] || null)) {
      await destroyCloudinaryAsset(existing.videoPublicId, "video");
    }
    if (existing.thumbnailPublicId !== (testimonialData.thumbnailPublicId || null)) {
      await destroyCloudinaryAsset(existing.thumbnailPublicId, "image");
    }
    if (existing.imagePublicId !== (imagePublicIds[0] || null)) {
      await destroyCloudinaryAsset(existing.imagePublicId, "image");
    }

    revalidatePath("/admin/testimonials");
    revalidatePath(`/admin/testimonials/${id}`);
    revalidatePath("/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update testimonial in database." };
  }
}

export async function deleteTestimonial(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Testimonial not found." };

    await prisma.testimonial.delete({ where: { id } });

    // Destroy Cloudinary assets
    for (const vPid of existing.videoPublicIds) {
      await destroyCloudinaryAsset(vPid, "video");
    }
    if (existing.videoPublicId && !existing.videoPublicIds.includes(existing.videoPublicId)) {
      await destroyCloudinaryAsset(existing.videoPublicId, "video");
    }

    for (const iPid of existing.imagePublicIds) {
      await destroyCloudinaryAsset(iPid, "image");
    }
    if (existing.imagePublicId && !existing.imagePublicIds.includes(existing.imagePublicId)) {
      await destroyCloudinaryAsset(existing.imagePublicId, "image");
    }

    if (existing.thumbnailPublicId) {
      await destroyCloudinaryAsset(existing.thumbnailPublicId, "image");
    }

    revalidatePath("/admin/testimonials");
    revalidatePath("/testimonials");
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
    await prisma.testimonial.update({ where: { id }, data: { isPublished } });
    revalidatePath("/admin/testimonials");
    revalidatePath("/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle testimonial publish:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}
