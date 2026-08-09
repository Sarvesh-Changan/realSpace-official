import Link from "next/link";
import Image from "next/image";
import { Plus, FolderOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProjectToggles, ProjectActions } from "./_components/ProjectTableClient";

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const projects = await prisma.project.findMany({
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-brand-red" /> Projects
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage interior & exterior showcase projects for REALSPACE.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-red text-white font-medium text-sm rounded-md hover:bg-brand-red/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Project
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {projects.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FolderOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-900">No projects yet</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Click &quot;Add Project&quot; to create your first portfolio showcase.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white font-medium text-sm rounded-md hover:bg-brand-red/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Type & Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Area / Year</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {projects.map((project) => {
                  const coverImage =
                    project.images.find((img) => img.isCoverImage) || project.images[0];

                  return (
                    <tr key={project.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-neutral-100 border border-neutral-200 relative overflow-hidden flex-shrink-0">
                            {coverImage?.url ? (
                              <Image
                                src={coverImage.url}
                                alt={coverImage.altText || project.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">{project.title}</div>
                            <div className="text-xs text-neutral-400 font-mono">/{project.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {project.designType}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {project.category.replace(/_/g, " ")} ({project.propertyType})
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-neutral-600 font-medium">
                        {project.location}
                      </td>

                      <td className="py-4 px-4 text-neutral-500 text-xs">
                        <div>{project.carpetAreaSqFt ? `${project.carpetAreaSqFt} SqFt` : "—"}</div>
                        <div>{project.completionYear ? `Built ${project.completionYear}` : ""}</div>
                      </td>

                      <td className="py-4 px-4">
                        <ProjectToggles
                          id={project.id}
                          isFeatured={project.isFeatured}
                          isPublished={project.isPublished}
                        />
                      </td>

                      <td className="py-4 px-4 text-right">
                        <ProjectActions id={project.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
