"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toggleTestimonialPublish, deleteTestimonial } from "../actions";

export function TestimonialToggles({
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
      await toggleTestimonialPublish(id, !isPublished);
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

export function TestimonialActions({
  id,
  authorName,
}: {
  id: string;
  authorName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete testimonial by "${authorName}"?`)) {
      startTransition(async () => {
        await deleteTestimonial(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/rera/testimonials/${id}/edit`}
        className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Edit Testimonial"
      >
        <Edit className="w-4 h-4" />
      </Link>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50"
        title="Delete Testimonial"
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

