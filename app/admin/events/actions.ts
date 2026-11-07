"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { eventSchema, type EventInput } from "./schema";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function destroyCloudinaryAsset(
  publicId: string | null | undefined,
  resourceType: "image" | "video" = "image"
) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete Cloudinary ${resourceType} asset (${publicId}):`, error);
  }
}

export async function createEvent(data: EventInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid event data." };
  }

  const payload = parsed.data;

  try {
    const existingSlug = await prisma.event.findUnique({
      where: { slug: payload.slug },
    });
    if (existingSlug) {
      return { success: false, error: "An event with this slug already exists." };
    }

    const event = await prisma.event.create({
      data: {
        title: payload.title,
        slug: payload.slug,
        coverImageUrl: payload.coverImageUrl,
        coverImagePublicId: payload.coverImagePublicId || null,
        isPublished: payload.isPublished,
        sortOrder: payload.sortOrder,
        media: {
          create: payload.media.map((item, idx) => ({
            mediaUrl: item.mediaUrl,
            mediaPublicId: item.mediaPublicId || null,
            mediaType: item.mediaType,
            sortOrder: item.sortOrder ?? idx,
          })),
        },
      },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true, id: event.id };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { success: false, error: "Failed to create event in database." };
  }
}

export async function updateEvent(id: string, data: EventInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid event data." };
  }

  const payload = parsed.data;

  try {
    const existing = await prisma.event.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!existing) {
      return { success: false, error: "Event not found." };
    }

    const existingSlug = await prisma.event.findFirst({
      where: {
        slug: payload.slug,
        NOT: { id },
      },
    });
    if (existingSlug) {
      return { success: false, error: "An event with this slug already exists." };
    }

    // Clean up replaced cover image on Cloudinary
    if (existing.coverImagePublicId && existing.coverImagePublicId !== payload.coverImagePublicId) {
      await destroyCloudinaryAsset(existing.coverImagePublicId, "image");
    }

    // Clean up removed gallery media assets on Cloudinary
    const newPublicIds = new Set(payload.media.map((m) => m.mediaPublicId).filter(Boolean));
    for (const oldMedia of existing.media) {
      if (oldMedia.mediaPublicId && !newPublicIds.has(oldMedia.mediaPublicId)) {
        await destroyCloudinaryAsset(oldMedia.mediaPublicId, oldMedia.mediaType === "VIDEO" ? "video" : "image");
      }
    }

    await prisma.$transaction([
      prisma.eventMedia.deleteMany({
        where: { eventId: id },
      }),
      prisma.event.update({
        where: { id },
        data: {
          title: payload.title,
          slug: payload.slug,
          coverImageUrl: payload.coverImageUrl,
          coverImagePublicId: payload.coverImagePublicId || null,
          isPublished: payload.isPublished,
          sortOrder: payload.sortOrder,
          media: {
            create: payload.media.map((item, idx) => ({
              mediaUrl: item.mediaUrl,
              mediaPublicId: item.mediaPublicId || null,
              mediaType: item.mediaType,
              sortOrder: item.sortOrder ?? idx,
            })),
          },
        },
      }),
    ]);

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath(`/admin/events/${id}/edit`);
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to update event:", error);
    return { success: false, error: "Failed to update event in database." };
  }
}

export async function deleteEvent(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!event) {
      return { success: false, error: "Event not found." };
    }

    // Delete DB record first (cascades to EventMedia)
    await prisma.event.delete({
      where: { id },
    });

    // Clean up Cloudinary assets
    if (event.coverImagePublicId) {
      await destroyCloudinaryAsset(event.coverImagePublicId, "image");
    }

    for (const m of event.media) {
      if (m.mediaPublicId) {
        await destroyCloudinaryAsset(m.mediaPublicId, m.mediaType === "VIDEO" ? "video" : "image");
      }
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return { success: false, error: "Failed to delete event." };
  }
}

export async function toggleEventPublished(id: string, isPublished: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.event.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle event published status:", error);
    return { success: false, error: "Failed to update published status." };
  }
}
