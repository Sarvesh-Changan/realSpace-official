"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  togglePropertyFeatured,
  togglePropertyNewLaunch,
  togglePropertyPublished,
  deleteProperty,
} from "../actions";

export function PropertyToggles({
  id,
  isFeatured,
  isNewLaunch,
  isPublished,
}: {
  id: string;
  isFeatured: boolean;
  isNewLaunch: boolean;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleFeatureToggle = () => {
    startTransition(async () => {
      await togglePropertyFeatured(id, !isFeatured);
      router.refresh();
    });
  };

  const handleNewLaunchToggle = () => {
    startTransition(async () => {
      await togglePropertyNewLaunch(id, !isNewLaunch);
      router.refresh();
    });
  };

  const handlePublishToggle = () => {
    startTransition(async () => {
      await togglePropertyPublished(id, !isPublished);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] leading-tight">
      <label className="flex items-center gap-1 cursor-pointer font-medium text-neutral-700 select-none">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={handlePublishToggle}
          disabled={isPending}
          className="h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 disabled:opacity-50 cursor-pointer"
        />
        <span>Published</span>
      </label>

      <label className="flex items-center gap-1 cursor-pointer text-neutral-600 select-none">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={handleFeatureToggle}
          disabled={isPending}
          className="h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 disabled:opacity-50 cursor-pointer"
        />
        <span>Featured</span>
      </label>

      <label className="flex items-center gap-1 cursor-pointer text-neutral-600 select-none">
        <input
          type="checkbox"
          checked={isNewLaunch}
          onChange={handleNewLaunchToggle}
          disabled={isPending}
          className="h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 disabled:opacity-50 cursor-pointer"
        />
        <span>New Launch</span>
      </label>
    </div>
  );
}

export function PropertyActions({
  id,
  slug,
  title,
}: {
  id: string;
  slug: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete property "${title}"? This will remove all associated images and cannot be undone.`)) {
      startTransition(async () => {
        await deleteProperty(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/rera/properties/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
        title="View Live Listing"
      >
        <ExternalLink className="w-4 h-4" />
      </Link>

      <Link
        href={`/admin/rera/properties/${id}/edit`}
        className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Edit Property"
      >
        <Edit className="w-4 h-4" />
      </Link>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50"
        title="Delete Property"
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

