"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toggleFaqPublish, deleteFaq } from "../actions";

export function FaqToggles({
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
      await toggleFaqPublish(id, !isPublished);
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

export function FaqActions({
  id,
  question,
}: {
  id: string;
  question: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete FAQ "${question}"?`)) {
      startTransition(async () => {
        await deleteFaq(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/rera/faqs/${id}/edit`}
        className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Edit FAQ"
      >
        <Edit className="w-4 h-4" />
      </Link>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50"
        title="Delete FAQ"
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

