"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { projectSchema, type ProjectInput } from "./schema";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function destroyCloudinaryAsset(publicId: string | null | undefined, resourceType: "image" | "video") {
  if (!publicId || publicId.startsWith("img-")) return;
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

export async function createProject(data: ProjectInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid project data." };
  }

  const projectData = parsed.data;
  const coverImageIndex = projectData.images.findIndex((image) => image.isCoverImage);
  let slug = projectData.slug ? generateSlug(projectData.slug) : generateSlug(projectData.title);

  // Ensure slug uniqueness
  let existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    const project = await prisma.project.create({
      data: {
        title: projectData.title,
        slug,
        designType: projectData.designType,
        propertyType: projectData.propertyType,
        category: projectData.category,
        location: projectData.location,
        description: projectData.description,
        servicesUsed: projectData.servicesUsed,
        carpetAreaSqFt: projectData.carpetAreaSqFt || null,
        completionYear: projectData.completionYear || null,
        isFeatured: projectData.isFeatured,
        isPublished: projectData.isPublished,
        sortOrder: projectData.sortOrder,
        images: {
          create: projectData.images.map((img, idx) => {
            const isVideo = img.mediaType === "VIDEO" || Boolean(img.url.match(/\.(mp4|mov|webm|ogv|m4v)/i)) || img.url.includes("/video/upload/");
            return {
              cloudinaryId: img.cloudinaryId || `img-${Date.now()}-${idx}`,
              url: img.url,
              mediaType: isVideo ? "VIDEO" : "IMAGE",
              thumbnailUrl: isVideo ? (img.thumbnailUrl || null) : null,
              thumbnailPublicId: isVideo ? (img.thumbnailPublicId || null) : null,
              altText: img.altText,
              isCoverImage: idx === coverImageIndex,
              sortOrder: img.sortOrder ?? idx,
            };
          }),
        },
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath(`/projects/${project.slug}`);
    return { success: true, id: project.id };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project in database." };
  }
}

export async function updateProject(id: string, data: ProjectInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid project data." };
  }

  const projectData = parsed.data;
  const coverImageIndex = projectData.images.findIndex((image) => image.isCoverImage);
  let slug = projectData.slug ? generateSlug(projectData.slug) : generateSlug(projectData.title);

  // Ensure slug uniqueness (excluding current project)
  const existingSlug = await prisma.project.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { images: true },
    });

    await prisma.$transaction(async (tx) => {
      // 1. Delete existing images for this project
      await tx.projectImage.deleteMany({
        where: { projectId: id },
      });

      // 2. Update project and recreate images
      await tx.project.update({
        where: { id },
        data: {
          title: projectData.title,
          slug,
          designType: projectData.designType,
          propertyType: projectData.propertyType,
          category: projectData.category,
          location: projectData.location,
          description: projectData.description,
          servicesUsed: projectData.servicesUsed,
          carpetAreaSqFt: projectData.carpetAreaSqFt || null,
          completionYear: projectData.completionYear || null,
          isFeatured: projectData.isFeatured,
          isPublished: projectData.isPublished,
          sortOrder: projectData.sortOrder,
          images: {
            create: projectData.images.map((img, idx) => {
              const isVideo = img.mediaType === "VIDEO" || Boolean(img.url.match(/\.(mp4|mov|webm|ogv|m4v)/i)) || img.url.includes("/video/upload/");
              return {
                cloudinaryId: img.cloudinaryId || `img-${Date.now()}-${idx}`,
                url: img.url,
                mediaType: isVideo ? "VIDEO" : "IMAGE",
                thumbnailUrl: isVideo ? (img.thumbnailUrl || null) : null,
                thumbnailPublicId: isVideo ? (img.thumbnailPublicId || null) : null,
                altText: img.altText,
                isCoverImage: idx === coverImageIndex,
                sortOrder: img.sortOrder ?? idx,
              };
            }),
          },
        },
      });
    });

    // 3. Cleanup removed Cloudinary assets
    if (existingProject?.images) {
      const newCloudinaryIds = new Set(projectData.images.map((img) => img.cloudinaryId).filter(Boolean));
      const newThumbnailPublicIds = new Set(projectData.images.map((img) => img.thumbnailPublicId).filter(Boolean));

      for (const oldImg of existingProject.images) {
        if (oldImg.cloudinaryId && !newCloudinaryIds.has(oldImg.cloudinaryId)) {
          await destroyCloudinaryAsset(oldImg.cloudinaryId, oldImg.mediaType === "VIDEO" ? "video" : "image");
        }
        if (oldImg.thumbnailPublicId && !newThumbnailPublicIds.has(oldImg.thumbnailPublicId)) {
          await destroyCloudinaryAsset(oldImg.thumbnailPublicId, "image");
        }
      }
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}/edit`);
    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath(`/projects/${slug}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update project:", error);
    return { success: false, error: "Failed to update project in database." };
  }
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const existing = await prisma.project.findUnique({
      where: { id },
      include: { images: true },
    });

    await prisma.project.delete({
      where: { id },
    });

    // Destroy Cloudinary assets associated with project images
    if (existing?.images) {
      for (const img of existing.images) {
        if (img.cloudinaryId) {
          await destroyCloudinaryAsset(img.cloudinaryId, img.mediaType === "VIDEO" ? "video" : "image");
        }
        if (img.thumbnailPublicId) {
          await destroyCloudinaryAsset(img.thumbnailPublicId, "image");
        }
      }
    }

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    if (existing?.slug) {
      revalidatePath(`/projects/${existing.slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project." };
  }
}

export async function toggleProjectPublish(id: string, isPublished: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: { isPublished },
      select: { slug: true },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    if (project?.slug) {
      revalidatePath(`/projects/${project.slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle publish:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}

export async function toggleProjectFeature(id: string, isFeatured: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: { isFeatured },
      select: { slug: true },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    if (project?.slug) {
      revalidatePath(`/projects/${project.slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle feature:", error);
    return { success: false, error: "Failed to update featured state." };
  }
}
