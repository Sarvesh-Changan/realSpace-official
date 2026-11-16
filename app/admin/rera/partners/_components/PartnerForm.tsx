"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import type { PartnerInput } from "../schema";

export function PartnerForm({
  initialData,
  onSubmitAction,
}: {
  initialData?: PartnerInput;
  onSubmitAction: (data: PartnerInput) => Promise<{ success: boolean; id?: string; error?: string }>;
}) {
  const router = useRouter();
  const [data, setData] = useState<PartnerInput>(initialData ?? {
    name: "", description: "", logoUrl: "", logoPublicId: "", sortOrder: 0, isPublished: true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uploadLogo = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Select an image file for the logo."); return; }
    setUploading(true); setError("");
    try {
      const signed = await fetch("/api/cloudinary/sign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "rera-partners", resourceType: "image" }),
      });
      const sign = await signed.json().catch(() => ({}));
      if (!signed.ok) throw new Error(sign.error || "Could not prepare image upload.");
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sign.apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
      body.append("timestamp", String(sign.timestamp));
      body.append("signature", sign.signature);
      body.append("folder", sign.folder || "rera-partners");
      const cloudName = sign.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) throw new Error("Cloudinary is not configured for image uploads.");
      const uploaded = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
      const result = await uploaded.json().catch(() => ({}));
      if (!uploaded.ok) throw new Error(result.error?.message || "Logo upload failed.");
      setData((current) => ({ ...current, logoUrl: result.secure_url, logoPublicId: result.public_id }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Logo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError("");
    const result = await onSubmitAction(data);
    if (result.success) { router.push("/admin/rera/partners"); router.refresh(); }
    else { setError(result.error || "Could not save partner."); setSaving(false); }
  };

  const field = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-neutral-700 focus:outline-none";
  return (
    <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
      {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      <div>
        <label className="text-sm font-medium text-neutral-800">Partner name *</label>
        <input required maxLength={160} value={data.name} onChange={(event) => setData({ ...data, name: event.target.value })} className={field} />
      </div>
      <div>
        <label className="text-sm font-medium text-neutral-800">Description</label>
        <textarea maxLength={1200} rows={3} value={data.description ?? ""} onChange={(event) => setData({ ...data, description: event.target.value })} className={field} />
      </div>
      <div>
        <label className="text-sm font-medium text-neutral-800">Logo *</label>
        {data.logoUrl && <div className="relative mb-3 h-32 w-52 overflow-hidden rounded border border-neutral-200 bg-white"><Image src={data.logoUrl} alt={`${data.name || "Partner"} logo preview`} fill sizes="208px" className="object-contain p-2" /></div>}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : data.logoUrl ? "Replace logo" : "Upload logo"}
          <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(event) => { void uploadLogo(event.target.files?.[0]); event.target.value = ""; }} />
        </label>
        {!data.logoUrl && <p className="mt-1 text-xs text-red-600">Upload a logo before saving.</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-neutral-800">Display order<input type="number" min={0} max={10000} value={data.sortOrder} onChange={(event) => setData({ ...data, sortOrder: Number(event.target.value) })} className={field} /></label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700"><input type="checkbox" checked={data.isPublished} onChange={(event) => setData({ ...data, isPublished: event.target.checked })} className="h-4 w-4 rounded border-neutral-300" /> Published on RERA homepage</label>
      </div>
      <button type="submit" disabled={saving || uploading || !data.logoUrl} className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Saving…" : "Save Partner"}
      </button>
    </form>
  );
}
