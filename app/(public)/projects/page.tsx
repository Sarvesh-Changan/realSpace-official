import prisma from "@/lib/prisma";
import {
  ProjectFilterGrid,
  type ProjectCardData,
} from "./_components/ProjectFilterGrid";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata = {
  title: "Interior & Exterior Projects | REALSPACE Thane",
  description:
    "Explore our portfolio of completed residential and commercial interior & exterior design projects in Thane and Mumbai.",
};

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

    formattedProjects = rawProjects.map((project) => ({
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
        project.images[0]?.url ||
        "/images/placeholder-image.png",
      altText: project.images[0]?.altText || project.title,
    }));
  } catch (error) {
    console.error("Error fetching projects from Prisma:", error);
    // Graceful fallback to empty array if query fails
  }

  return <ProjectFilterGrid projects={formattedProjects} />;
}
