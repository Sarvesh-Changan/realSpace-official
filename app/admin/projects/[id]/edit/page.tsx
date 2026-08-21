import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ProjectForm } from "../../_components/ProjectForm";
import { updateProject } from "../../actions";
import type { ProjectInput } from "../../schema";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const initialData: ProjectInput = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    designType: project.designType,
    propertyType: project.propertyType,
    category: project.category,
    location: project.location,
    description: project.description,
    servicesUsed: project.servicesUsed,
    carpetAreaSqFt: project.carpetAreaSqFt,
    completionYear: project.completionYear,
    isFeatured: project.isFeatured,
    isPublished: project.isPublished,
    sortOrder: project.sortOrder,
    images: project.images.map((img) => ({
      id: img.id,
      url: img.url,
      cloudinaryId: img.cloudinaryId,
      altText: img.altText,
      mediaType: img.mediaType,
      isCoverImage: img.isCoverImage,
      sortOrder: img.sortOrder,
    })),
  };

  const handleUpdate = async (data: ProjectInput) => {
    "use server";
    return updateProject(id, data);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Project</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update project details, categories, or images.
        </p>
      </div>

      <ProjectForm initialData={initialData} onSubmitAction={handleUpdate} />
    </div>
  );
}
