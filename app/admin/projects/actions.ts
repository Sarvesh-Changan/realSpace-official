"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { projectSchema, type ProjectInput } from "./schema";

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
          create: projectData.images.map((img, idx) => ({
            cloudinaryId: img.cloudinaryId || `img-${Date.now()}-${idx}`,
            url: img.url,
            altText: img.altText,
            isCoverImage: img.isCoverImage,
            sortOrder: img.sortOrder ?? idx,
          })),
        },
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
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
            create: projectData.images.map((img, idx) => ({
              cloudinaryId: img.cloudinaryId || `img-${Date.now()}-${idx}`,
              url: img.url,
              altText: img.altText,
              isCoverImage: img.isCoverImage,
              sortOrder: img.sortOrder ?? idx,
            })),
          },
        },
      });
    });

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}/edit`);
    revalidatePath("/projects");
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
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
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
    await prisma.project.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
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
    await prisma.project.update({
      where: { id },
      data: { isFeatured },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle feature:", error);
    return { success: false, error: "Failed to update featured state." };
  }
}
