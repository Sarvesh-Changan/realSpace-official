"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { saveWebsitePage, type WebsiteContentState } from "../actions";

type Section = { sectionKey: string; heading: string | null; body: string | null; imageUrl: string | null; imagePublicId?: string | null; imageAlt: string | null; mediaAssetId?: string | null; buttonLabel: string | null; buttonUrl: string | null; isEnabled: boolean; sortOrder?: number };
type Media = { id: string; url: string; cloudinaryId: string | null; altText: string; category: string };
const blank: WebsiteContentState = {};

function ImagePicker({ name, section, media }: { name: string; section?: Section; media: Media[] }) {
  const [assetId, setAssetId] = useState(section?.mediaAssetId || "");
  const selected = media.find((item) => item.id === assetId);
  const [url, setUrl] = useState(section?.imageUrl || selected?.url || "");
  const [alt, setAlt] = useState(section?.imageAlt || selected?.altText || "");
  return <div className="space-y-2">
    <label className="block text-xs font-medium text-neutral-600">Choose an uploaded image</label>
    <select name={`${name}.mediaAssetId`} value={assetId} onChange={(event) => { const nextId = event.target.value; setAssetId(nextId); const next = media.find((item) => item.id === nextId); if (next) { setUrl(next.url); setAlt(next.altText); } }} className="w-full rounded-lg border px-3 py-2">
      <option value="">No Media Library selection</option>
      {media.map((asset) => <option key={asset.id} value={asset.id}>{asset.category} · {asset.altText || asset.url}</option>)}
    </select>
    {selected && <div className="relative h-36 w-full max-w-sm overflow-hidden rounded-lg bg-neutral-100"><Image src={selected.url} alt={selected.altText || "Selected image"} fill sizes="384px" className="object-cover" unoptimized={!selected.url.includes("res.cloudinary.com")} /></div>}
    <label className="block text-xs font-medium text-neutral-600">Image URL<input name={`${name}.imageUrl`} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Image URL" className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
    <input type="hidden" name={`${name}.imagePublicId`} value={selected?.cloudinaryId || (assetId ? "" : section?.imagePublicId || "")} />
    <label className="block text-xs font-medium text-neutral-600">Alt text<input name={`${name}.imageAlt`} value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Describe the image" className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
  </div>;
}

export function WebsitePageEditor({ page, sections, media }: { page: { slug: string; title: string; description: string | null; isPublished: boolean }; sections: Section[]; media: Media[] }) {
  const [state, action, pending] = useActionState(saveWebsitePage, blank);
  const names: Record<string, string> = { hero: "Hero / page banner", intro: "Introduction", details: "Additional content", cta: "Call to action", slide1: "Hero slide 1", slide2: "Hero slide 2", slide3: "Hero slide 3", slide4: "Hero slide 4", slide5: "Hero slide 5", welcome: "Welcome section", services: "Services section", properties: "Properties section", gallery: "Gallery section", testimonials: "Testimonials section", faqs: "FAQs section", contact: "Contact section", callback: "Callback section" };
  return <form action={action} className="max-w-4xl space-y-6">
    <input type="hidden" name="slug" value={page.slug} />
    <header><Link href="/admin/website-content" className="text-sm text-brand-red">← Website Content</Link><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold">Edit {page.slug === "home" ? "Homepage" : page.title}</h1><p className="mt-1 text-sm text-neutral-500">Changes remain drafts until published. Use the preview to review the saved draft.</p></div><Link href={`/admin/website-content/${page.slug}/preview`} className="rounded-lg border px-4 py-2 text-sm font-medium">Preview draft</Link></div></header>
    <section className="space-y-4 rounded-xl border bg-white p-5"><h2 className="font-semibold">Page settings</h2><label className="block text-sm">Page title<input name="title" defaultValue={page.title} required className="mt-1 block w-full rounded-lg border px-3 py-2" /></label><label className="block text-sm">Search description<textarea name="description" defaultValue={page.description || ""} rows={3} className="mt-1 block w-full rounded-lg border px-3 py-2" /></label><p className="text-xs text-neutral-500">Current status: {page.isPublished ? "Published" : "Draft"}</p></section>
    {sections.map((section) => { const key = section.sectionKey; return <section key={key} className="space-y-4 rounded-xl border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{names[key] || key}</h2><label className="flex items-center gap-2 text-sm"><input type="checkbox" name={`${key}.isEnabled`} defaultChecked={section.isEnabled} /> Enabled</label></div>
      <label className="block text-sm">Display order<input type="number" name={`${key}.sortOrder`} defaultValue={section.sortOrder ?? 0} min="0" className="mt-1 block w-28 rounded-lg border px-3 py-2" /></label>
      <label className="block text-sm">Heading<input name={`${key}.heading`} defaultValue={section.heading || ""} className="mt-1 block w-full rounded-lg border px-3 py-2" /></label>
      <label className="block text-sm">Text content<textarea name={`${key}.body`} defaultValue={section.body || ""} rows={4} className="mt-1 block w-full rounded-lg border px-3 py-2" /></label>
      <ImagePicker name={key} section={section} media={media} />
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Button label<input name={`${key}.buttonLabel`} defaultValue={section.buttonLabel || ""} className="mt-1 block w-full rounded-lg border px-3 py-2" /></label><label className="text-sm">Button URL<input name={`${key}.buttonUrl`} defaultValue={section.buttonUrl || ""} className="mt-1 block w-full rounded-lg border px-3 py-2" /></label></div>
    </section>; })}
    {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}{state.success && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{state.message}</p>}
    <div className="sticky bottom-2 flex flex-wrap gap-3 rounded-xl border bg-white/95 p-3 shadow-lg"><button name="actionMode" value="draft" disabled={pending} className="rounded-lg border px-5 py-3 font-semibold disabled:opacity-50">{pending ? "Saving…" : "Save Draft"}</button><button name="actionMode" value="publish" disabled={pending} className="rounded-lg bg-neutral-900 px-5 py-3 font-semibold text-white disabled:opacity-50">Publish Changes</button>{page.isPublished && <button name="actionMode" value="unpublish" disabled={pending} className="rounded-lg border border-red-200 px-5 py-3 font-semibold text-red-700 disabled:opacity-50">Unpublish</button>}</div>
  </form>;
}
