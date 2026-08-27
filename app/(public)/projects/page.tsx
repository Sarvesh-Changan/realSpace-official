import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import {
  ProjectFilterGrid,
  type ProjectCardData,
} from "./_components/ProjectFilterGrid";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";

  return constructMetadata({
    title: `Featured Portfolio & Projects | ${companyName}`,
    description: "Explore our portfolio of completed residential and commercial interior & exterior design projects in Thane, Mumbai, and Navi Mumbai.",
    path: "/projects",
  });
}

export default async function ProjectsPage() {
  let formattedProjects: ProjectCardData[] = [];

  try {
    const rawProjects = await prisma.project.findMany({
      where: {
        isPublished: true,
      },
      include: {
        images: {
          orderBy: [
            { isCoverImage: "desc" },
            { sortOrder: "asc" },
          ],
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    formattedProjects = rawProjects.map((project) => {
      const coverImage =
        project.images.find((image) => image.isCoverImage) ||
        project.images[0];

      return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      designType: project.designType,
      propertyType: project.propertyType,
      category: project.category,
      location: project.location,
      description: project.description,
      carpetAreaSqFt: project.carpetAreaSqFt,
      completionYear: project.completionYear,
      coverImageUrl:
        coverImage?.url ||
        "/images/placeholder-image.png",
      altText: coverImage?.altText || project.title,
      };
    });
  } catch (error) {
    console.error("Error fetching projects from Prisma:", error);
    // Graceful fallback to empty array if query fails
  }

  return <ProjectFilterGrid projects={formattedProjects} />;
}
