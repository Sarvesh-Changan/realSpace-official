"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toggleProjectFeature, toggleProjectPublish, deleteProject } from "../actions";

export function ProjectToggles({ id, isFeatured, isPublished }: { id: string, isFeatured: boolean, isPublished: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleFeatureToggle = () => {
    startTransition(async () => {
      await toggleProjectFeature(id, !isFeatured);
      router.refresh();
    });
  };

  const handlePublishToggle = () => {
    startTransition(async () => {
      await toggleProjectPublish(id, !isPublished);
      router.refresh();
    });
  };

  return (
    <div className="flex gap-4">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input 
          type="checkbox" 
          checked={isFeatured} 
          onChange={handleFeatureToggle}
          disabled={isPending}
          className="rounded text-brand-red focus:ring-brand-red disabled:opacity-50"
        />
        Featured
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input 
          type="checkbox" 
          checked={isPublished} 
          onChange={handlePublishToggle}
          disabled={isPending}
          className="rounded text-brand-red focus:ring-brand-red disabled:opacity-50"
        />
        Published
      </label>
    </div>
  );
}

export function ProjectActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project?")) {
      startTransition(async () => {
        await deleteProject(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => router.push(`/admin/projects/${id}/edit`)}
        className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        disabled={isPending}
        title="Edit Project"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete Project"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
