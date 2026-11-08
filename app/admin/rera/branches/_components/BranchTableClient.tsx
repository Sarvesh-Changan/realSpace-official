"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Loader2, MapPin } from "lucide-react";
import { toggleBranchPublish, deleteBranch } from "../actions";

export function BranchToggles({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePublishToggle = () => {
    startTransition(async () => {
      await toggleBranchPublish(id, !isPublished);
      router.refresh();
    });
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 select-none">
      <input
        type="checkbox"
        checked={isPublished}
        onChange={handlePublishToggle}
        disabled={isPending}
        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 disabled:opacity-50 cursor-pointer h-4 w-4"
      />
      <span>{isPublished ? "Published" : "Draft"}</span>
    </label>
  );
}

export function BranchActions({
  id,
  name,
  mapUrl,
}: {
  id: string;
  name: string;
  mapUrl?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete branch "${name}"?`)) {
      startTransition(async () => {
        await deleteBranch(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          title="Open Google Maps"
        >
          <MapPin className="w-4 h-4 text-emerald-600" />
        </a>
      )}

      <Link
        href={`/admin/rera/branches/${id}/edit`}
        className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Edit Branch"
      >
        <Edit className="w-4 h-4" />
      </Link>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50"
        title="Delete Branch"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

