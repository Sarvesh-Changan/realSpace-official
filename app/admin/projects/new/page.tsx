import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectForm } from "../_components/ProjectForm";
import { createProject } from "../actions";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Create New Project</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Add a new showcase project to the REALSPACE portfolio.
        </p>
      </div>

      <ProjectForm onSubmitAction={createProject} />
    </div>
  );
}
