"use client";

import { useState } from "react";

export function ArnavImageInput({ name, initialUrl, initialAlt }: { name: string; initialUrl?: string | null; initialAlt?: string | null }) {
  const [url, setUrl] = useState(initialUrl || "");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const signed = await fetch("/api/cloudinary/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folder: "arnav-content" }) });
      const config = await signed.json();
      if (!signed.ok) throw new Error(config.error || "Upload signing failed.");
      const data = new FormData();
      data.append("file", file); data.append("api_key", config.apiKey); data.append("timestamp", String(config.timestamp)); data.append("folder", config.folder); data.append("signature", config.signature);
      const result = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, { method: "POST", body: data });
      const asset = await result.json();
      if (!result.ok) throw new Error(asset.error?.message || "Image upload failed.");
      setUrl(asset.secure_url);
    } catch (e) { setError(e instanceof Error ? e.message : "Image upload failed."); }
    finally { setUploading(false); }
  }

  return <div className="space-y-2">
    <input name={`${name}.imageUrl`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL" className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
    <input name={`${name}.imageAlt`} defaultValue={initialAlt || ""} placeholder="Image alt text" className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => upload(e.target.files?.[0])} className="block w-full text-sm" />
    {uploading && <p className="text-sm text-neutral-500">Uploading image…</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {url && <img src={url} alt={initialAlt || "Upload preview"} className="h-28 max-w-full rounded object-cover" />}
  </div>;
}
