import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProjectGallery } from "./_components/ProjectGallery";
import { ProjectHeader } from "./_components/ProjectHeader";
import { ProjectDescription } from "./_components/ProjectDescription";
import { ProjectDetails } from "./_components/ProjectDetails";
import { RelatedProjects } from "./_components/RelatedProjects";
import { ProjectCta } from "./_components/ProjectCta";

export interface ProjectImage {
  id: string;
  url: string;
  altText: string;
  mediaType?: "IMAGE" | "VIDEO";
}

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  designType: "INTERIOR" | "EXTERIOR";
  propertyType: "RESIDENTIAL" | "COMMERCIAL";
  category: string;
  location: string;
  description: string;
  servicesUsed: string[];
  carpetAreaSqFt?: number | null;
  completionYear?: number | null;
  images: ProjectImage[];
}

export interface RelatedProjectData {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  category: string;
}

export const revalidate = 60; // Revalidate dynamic project detail page every 60 seconds

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
    });

    if (!project) {
      return { title: "Project Not Found | REALSPACE" };
    }

    return {
      title: `${project.title} | REALSPACE Projects`,
      description: project.description.slice(0, 160),
    };
  } catch {
    return { title: "Project Detail | REALSPACE" };
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let project;
  let relatedProjectsRaw: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    images: Array<{ url: string; altText: string }>;
  }> = [];

  try {
    project = await prisma.project.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: [
            { isCoverImage: "desc" },
            { sortOrder: "asc" },
          ],
        },
      },
    });

    if (!project || !project.isPublished) {
      notFound();
    }

    relatedProjectsRaw = await prisma.project.findMany({
      where: {
        designType: project.designType,
        isPublished: true,
        id: { not: project.id },
      },
      include: {
        images: {
          orderBy: [
            { isCoverImage: "desc" },
            { sortOrder: "asc" },
          ],
          take: 1,
        },
      },
      orderBy: { sortOrder: "asc" },
      take: 3,
    });
  } catch (error) {
    console.error("Error fetching project detail from Prisma:", error);
    notFound();
  }

  // Map main project images
  const projectImages: ProjectImage[] = project.images.map((img: any) => ({
    id: img.id,
    url: img.url,
    altText: img.altText || project.title,
    mediaType: img.mediaType,
  }));

  // Fallback image if project has no image records
  if (projectImages.length === 0) {
    projectImages.push({
      id: "fallback-cover",
      url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600",
      altText: project.title,
    });
  }

  const projectData: ProjectData = {
    id: project.id,
    slug: project.slug,
    title: project.title,
    designType: project.designType,
    propertyType: project.propertyType,
    category: formatCategory(project.category),
    location: project.location,
    description: project.description,
    servicesUsed: project.servicesUsed,
    carpetAreaSqFt: project.carpetAreaSqFt,
    completionYear: project.completionYear,
    images: projectImages,
  };

  const relatedProjects: RelatedProjectData[] = relatedProjectsRaw.map(
    (p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: formatCategory(p.category),
      imageUrl:
        p.images[0]?.url ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    })
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 mt-16 md:mt-0">
      <article>
        {/* Top Image Gallery */}
        <ProjectGallery images={projectData.images} />

        {/* Content Split */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12 lg:gap-20">
          {/* Main Content Column */}
          <div className="flex flex-col gap-10">
            <ProjectHeader
              title={projectData.title}
              category={projectData.category}
              designType={projectData.designType}
              location={projectData.location}
              completionYear={projectData.completionYear ?? undefined}
            />
            <ProjectDescription description={projectData.description} />
          </div>

          {/* Sidebar Column */}
          <div>
            <div className="sticky top-24">
              <ProjectDetails
                propertyType={projectData.propertyType}
                carpetAreaSqFt={projectData.carpetAreaSqFt ?? undefined}
                servicesUsed={projectData.servicesUsed}
              />
            </div>
          </div>
        </div>
      </article>

      {/* Bottom Sections */}
      <RelatedProjects projects={relatedProjects} />
      <ProjectCta />
    </div>
  );
}
