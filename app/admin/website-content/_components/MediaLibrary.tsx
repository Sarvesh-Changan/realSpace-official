"use client";

import Image from "next/image";
import { useState } from "react";
import { createMediaAssets, deleteMediaAsset, updateMediaAsset } from "../actions";

type Asset = { id: string; url: string; cloudinaryId: string | null; altText: string; category: string; format: string | null; width: number | null; height: number | null; fileSizeBytes: number | null; sortOrder: number };
type UploadAsset = { url: string; cloudinaryId: string; altText: string; category: string; format?: string; width?: number; height?: number; fileSizeBytes?: number };

async function uploadImage(file: File, category: string): Promise<UploadAsset> {
  const signResponse = await fetch("/api/cloudinary/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folder: "website-media" }) });
  const config = await signResponse.json();
  if (!signResponse.ok) throw new Error(config.error || "Could not prepare image upload.");
  const form = new FormData();
  form.append("file", file); form.append("api_key", config.apiKey); form.append("timestamp", String(config.timestamp)); form.append("folder", config.folder); form.append("signature", config.signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, { method: "POST", body: form });
  const image = await response.json();
  if (!response.ok) throw new Error(image.error?.message || "Image upload failed.");
  return { url: image.secure_url, cloudinaryId: image.public_id, altText: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), category, format: image.format, width: image.width, height: image.height, fileSizeBytes: image.bytes };
}

export function MediaLibrary({ assets }: { assets: Asset[] }) {
  const [category, setCategory] = useState("general");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const uploaded = await Promise.all(files.map((file) => uploadImage(file, category)));
      const saved = await createMediaAssets(uploaded);
      if (!saved.success) throw new Error(saved.error || "Uploaded images could not be added to the library.");
      setMessage(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} saved to the media library.`);
      window.location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { setBusy(false); }
  }

  async function saveAsset(asset: Asset, form: HTMLFormElement) {
    const data = new FormData(form);
    setError(""); setMessage("");
    const result = await updateMediaAsset(asset.id, { altText: String(data.get("altText") || ""), category: String(data.get("category") || "general"), sortOrder: Number(data.get("sortOrder") || 0) });
    if (result.success) { setMessage("Image details saved."); window.location.reload(); }
    else setError(result.error || "Could not save image details.");
  }

  async function removeAsset(asset: Asset) {
    if (!window.confirm(`Delete “${asset.altText || asset.url}” from the Media Library? The image will only be removed from Cloudinary if no other module uses it.`)) return;
    const result = await deleteMediaAsset(asset.id);
    if (result.success) window.location.reload();
    else setError(result.error || "Could not delete image.");
  }

  return <div className="space-y-6">
    <section className="rounded-xl border bg-white p-5">
      <h2 className="font-semibold">Upload images</h2><p className="mt-1 text-sm text-neutral-500">Images upload to the existing Cloudinary account and their URLs and metadata are saved in the database.</p>
      <div className="mt-4 flex flex-wrap items-end gap-3"><label className="text-sm">Category<input value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 block w-48 rounded-lg border px-3 py-2" maxLength={60} /></label><label className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white">{busy ? "Uploading…" : "Choose images"}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={handleUpload} className="sr-only" /></label></div>
      {busy && <p role="status" className="mt-3 text-sm text-neutral-600">Uploading images and saving metadata…</p>}
    </section>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}{message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{assets.map((asset) => <article key={asset.id} className="overflow-hidden rounded-xl border bg-white">
      <div className="relative aspect-[4/3] bg-neutral-100"><Image src={asset.url} alt={asset.altText} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" unoptimized={!asset.url.includes("res.cloudinary.com")} /></div>
      <div className="p-4"><div className="mb-3 flex items-center justify-between gap-2"><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs">{asset.category}</span><span className="text-xs text-neutral-500">{asset.width && asset.height ? `${asset.width} × ${asset.height}` : "Dimensions unavailable"}{asset.fileSizeBytes ? ` · ${(asset.fileSizeBytes / 1024 / 1024).toFixed(2)} MB` : ""}{asset.format ? ` · ${asset.format.toUpperCase()}` : ""}</span></div>
        <form onSubmit={(event) => { event.preventDefault(); void saveAsset(asset, event.currentTarget); }} className="space-y-2"><label className="block text-xs">Alt text<input name="altText" defaultValue={asset.altText} required maxLength={300} className="mt-1 w-full rounded border px-2.5 py-2 text-sm" /></label><div className="grid grid-cols-2 gap-2"><label className="block text-xs">Category<input name="category" defaultValue={asset.category} required maxLength={60} className="mt-1 w-full rounded border px-2.5 py-2 text-sm" /></label><label className="block text-xs">Order<input name="sortOrder" type="number" min="0" defaultValue={asset.sortOrder} className="mt-1 w-full rounded border px-2.5 py-2 text-sm" /></label></div><div className="flex justify-between gap-2 pt-1"><button className="rounded border px-3 py-2 text-sm font-medium">Save details</button><button type="button" onClick={() => void removeAsset(asset)} className="rounded border border-red-200 px-3 py-2 text-sm text-red-700">Delete</button></div></form>
      </div></article>)}</div>
    {assets.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-neutral-500">No uploaded media yet.</div>}
  </div>;
}
