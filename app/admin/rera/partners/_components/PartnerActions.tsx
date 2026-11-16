"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { deletePartner, togglePartnerPublish } from "../actions";

export function PartnerVisibility({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <label className="flex items-center gap-2 whitespace-nowrap text-xs text-neutral-700"><input type="checkbox" checked={isPublished} disabled={pending} onChange={() => startTransition(async () => { const result = await togglePartnerPublish(id, !isPublished); if (result.success) router.refresh(); })} className="h-4 w-4" />{isPublished ? "Published" : "Draft"}</label>;
}

export function PartnerActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <div className="flex justify-end gap-2">
    <Link href={`/admin/rera/partners/${id}/edit`} aria-label={`Edit ${name}`} className="rounded p-2 text-neutral-500 hover:bg-blue-50 hover:text-blue-600"><Edit className="h-4 w-4" /></Link>
    <button type="button" disabled={pending} aria-label={`Delete ${name}`} onClick={() => { if (confirm(`Delete partner “${name}”?`)) startTransition(async () => { const result = await deletePartner(id); if (result.success) router.refresh(); }); }} className="rounded p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
  </div>;
}
