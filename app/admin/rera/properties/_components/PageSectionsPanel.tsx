"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import {
  assetSchema,
  reraPropertySectionSchema,
  type Asset,
  type InfoCardsData,
  type PhaseCardsData,
  type ReraPropertySectionData,
  type TextBlockData,
  type UnitTypesData,
} from "@/lib/rera/property-sections/schemas";
import { createSection, deleteSection, reorderSections, toggleSectionPublished, updateSection } from "../sections-actions";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const inputClass = "mt-1 block w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";
const smallButtonClass = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40";
const SectionTypes = [
  { type: "INFO_CARDS", label: "Highlight Cards" },
  { type: "PHASE_CARDS", label: "Tower / Phase Cards" },
  { type: "UNIT_TYPES", label: "Unit Types with Floor Plans" },
  { type: "TEXT_BLOCK", label: "Text Block" },
] as const;

export type PageSectionRow = {
  id: string;
  type: ReraPropertySectionData["type"];
  title: string | null;
  data: unknown;
  sortOrder: number;
  isPublished: boolean;
};

function makeSection(type: ReraPropertySectionData["type"]): ReraPropertySectionData {
  switch (type) {
    case "INFO_CARDS": return { type, title: null, data: { cards: [{ title: "", lines: [] }] } };
    case "PHASE_CARDS": return { type, title: null, data: { cards: [{ title: "", lines: [] }] } };
    case "UNIT_TYPES": return { type, title: null, data: { units: [{ title: "", planImages: [], fields: [] }] } };
    case "TEXT_BLOCK": return { type, title: null, data: { body: "", align: "left" } };
  }
}

function Counter({ value, max }: { value: string; max: number }) {
  return <span className={`text-[11px] ${value.length > max ? "text-red-600" : "text-neutral-400"}`}>{value.length}/{max}</span>;
}

function TextField({ label, value, max, onChange, multiline = false }: {
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return <label className="block text-xs font-medium text-neutral-700">
    <span className="flex items-center justify-between gap-2">{label}<Counter value={value} max={max} /></span>
    {multiline ? <textarea value={value} maxLength={max} rows={4} onChange={(event) => onChange(event.target.value)} className={inputClass} />
      : <input type="text" value={value} maxLength={max} onChange={(event) => onChange(event.target.value)} className={inputClass} />}
  </label>;
}

function AssetUploader({ value, onChange, label }: { value?: Asset; onChange: (asset?: Asset) => void; label: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`This file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The limit is 100 MB.`);
      event.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const signatureResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "rera-properties", resourceType: "image" }),
      });
      const signature = await signatureResponse.json().catch(() => ({}));
      if (!signatureResponse.ok) throw new Error(signature.error || "Could not prepare the image upload.");

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signature.apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
      body.append("timestamp", String(signature.timestamp));
      body.append("signature", signature.signature);
      body.append("folder", signature.folder || "rera-properties");
      const cloudName = signature.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) throw new Error("Cloudinary is not configured for uploads.");

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
      const uploaded = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok) throw new Error(uploaded.error?.message || "Image upload failed.");

      const nextAsset = assetSchema.parse({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        alt: value?.alt ?? file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim(),
      });
      onChange(nextAsset);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return <div className="space-y-2 rounded border border-neutral-200 bg-neutral-50 p-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-xs font-semibold text-neutral-700">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={smallButtonClass}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {value ? "Replace image" : "Upload image"}
        </button>
        {value && <button type="button" onClick={() => { onChange(undefined); setError(null); }} disabled={uploading} className={smallButtonClass}>
          <X className="h-3.5 w-3.5" /> Remove
        </button>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={upload} disabled={uploading} className="sr-only" aria-label={`Upload ${label}`} />
    </div>
    {error && <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    {value && <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded border border-neutral-200 bg-white">
        <Image src={value.url} alt={value.alt} fill sizes="160px" className="object-contain" unoptimized />
      </div>
      <TextField label="Alternative text (required)" value={value.alt} max={200} onChange={(alt) => onChange({ ...value, alt })} />
    </div>}
    <p className="text-[11px] text-neutral-500">Image files up to 100 MB. Add descriptive alternative text before saving.</p>
  </div>;
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ReorderButtons({ index, count, onMove }: { index: number; count: number; onMove: (to: number) => void }) {
  return <div className="flex gap-1">
    <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(index - 1)} className={smallButtonClass}><ArrowUp className="h-3.5 w-3.5" /></button>
    <button type="button" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(index + 1)} className={smallButtonClass}><ArrowDown className="h-3.5 w-3.5" /></button>
  </div>;
}

function InfoCardsEditor({ data, onChange }: { data: InfoCardsData; onChange: (data: InfoCardsData) => void }) {
  const cards = data.cards;
  return <div className="space-y-3">
    <div className="flex items-center justify-between text-xs text-neutral-600"><span>Cards: {cards.length}/6</span><button type="button" disabled={cards.length >= 6} onClick={() => onChange({ cards: [...cards, { title: "", lines: [] }] })} className={smallButtonClass}><Plus className="h-3.5 w-3.5" /> Add card</button></div>
    {cards.map((card, index) => <div key={index} className="space-y-3 rounded-md border border-neutral-200 p-3">
      <div className="flex items-center justify-between"><strong className="text-xs text-neutral-700">Card {index + 1}</strong><div className="flex gap-2"><ReorderButtons index={index} count={cards.length} onMove={(to) => onChange({ cards: moveItem(cards, index, to) })} /><button type="button" disabled={cards.length <= 1} onClick={() => onChange({ cards: cards.filter((_, i) => i !== index) })} className={smallButtonClass}><Trash2 className="h-3.5 w-3.5" /> Remove</button></div></div>
      <TextField label="Title" value={card.title} max={80} onChange={(title) => onChange({ cards: cards.map((item, i) => i === index ? { ...item, title } : item) })} />
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-neutral-700"><span>Lines ({card.lines.length}/30; max 200 chars each)</span><button type="button" disabled={card.lines.length >= 30} onClick={() => onChange({ cards: cards.map((item, i) => i === index ? { ...item, lines: [...item.lines, ""] } : item) })} className={smallButtonClass}><Plus className="h-3 w-3" /> Add line</button></div>
        {card.lines.map((line, lineIndex) => <div key={lineIndex} className="flex items-start gap-2"><div className="min-w-0 flex-1"><textarea rows={2} maxLength={200} value={line} onChange={(event) => onChange({ cards: cards.map((item, i) => i === index ? { ...item, lines: item.lines.map((entry, j) => j === lineIndex ? event.target.value : entry) } : item) })} className={`${inputClass} mt-0`} /><Counter value={line} max={200} /></div><ReorderButtons index={lineIndex} count={card.lines.length} onMove={(to) => onChange({ cards: cards.map((item, i) => i === index ? { ...item, lines: moveItem(item.lines, lineIndex, to) } : item) })} /><button type="button" onClick={() => onChange({ cards: cards.map((item, i) => i === index ? { ...item, lines: item.lines.filter((_, j) => j !== lineIndex) } : item) })} className={smallButtonClass}><Trash2 className="h-3.5 w-3.5" /></button></div>)}
      </div>
      <TextField label="Optional body" value={card.body ?? ""} max={1000} multiline onChange={(body) => onChange({ cards: cards.map((item, i) => i === index ? { ...item, body: body || undefined } : item) })} />
      <AssetUploader label="Optional card image" value={card.image} onChange={(image) => onChange({ cards: cards.map((item, i) => i === index ? { ...item, image } : item) })} />
    </div>)}
  </div>;
}

function PhaseCardsEditor({ data, onChange }: { data: PhaseCardsData; onChange: (data: PhaseCardsData) => void }) {
  const cards = data.cards;
  return <div className="space-y-3">
    <TextField label="Section subtitle (optional)" value={data.subtitle ?? ""} max={120} onChange={(subtitle) => onChange({ ...data, subtitle: subtitle || undefined })} />
    <div className="flex items-center justify-between text-xs text-neutral-600"><span>Cards: {cards.length}/8</span><button type="button" disabled={cards.length >= 8} onClick={() => onChange({ ...data, cards: [...cards, { title: "", lines: [] }] })} className={smallButtonClass}><Plus className="h-3.5 w-3.5" /> Add card</button></div>
    {cards.map((card, index) => <div key={index} className="space-y-3 rounded-md border border-neutral-200 p-3">
      <div className="flex items-center justify-between"><strong className="text-xs text-neutral-700">Phase {index + 1}</strong><div className="flex gap-2"><ReorderButtons index={index} count={cards.length} onMove={(to) => onChange({ ...data, cards: moveItem(cards, index, to) })} /><button type="button" disabled={cards.length <= 1} onClick={() => onChange({ ...data, cards: cards.filter((_, i) => i !== index) })} className={smallButtonClass}><Trash2 className="h-3.5 w-3.5" /> Remove</button></div></div>
      <TextField label="Title" value={card.title} max={80} onChange={(title) => onChange({ ...data, cards: cards.map((item, i) => i === index ? { ...item, title } : item) })} />
      <TextField label="Card subtitle (optional)" value={card.subtitle ?? ""} max={120} onChange={(subtitle) => onChange({ ...data, cards: cards.map((item, i) => i === index ? { ...item, subtitle: subtitle || undefined } : item) })} />
      <div className="space-y-2"><div className="flex items-center justify-between text-xs font-medium text-neutral-700"><span>Lines ({card.lines.length}/30; max 200 chars each)</span><button type="button" disabled={card.lines.length >= 30} onClick={() => onChange({ ...data, cards: cards.map((item, i) => i === index ? { ...item, lines: [...item.lines, ""] } : item) })} className={smallButtonClass}><Plus className="h-3 w-3" /> Add line</button></div>
        {card.lines.map((line, lineIndex) => <div key={lineIndex} className="flex items-start gap-2"><div className="min-w-0 flex-1"><textarea rows={2} maxLength={200} value={line} onChange={(event) => onChange({ ...data, cards: cards.map((item, i) => i === index ? { ...item, lines: item.lines.map((entry, j) => j === lineIndex ? event.target.value : entry) } : item) })} className={`${inputClass} mt-0`} /><Counter value={line} max={200} /></div><ReorderButtons index={lineIndex} count={card.lines.length} onMove={(to) => onChange({ ...data, cards: cards.map((item, i) => i === index ? { ...item, lines: moveItem(item.lines, lineIndex, to) } : item) })} /><button type="button" onClick={() => onChange({ ...data, cards: cards.map((item, i) => i === index ? { ...item, lines: item.lines.filter((_, j) => j !== lineIndex) } : item) })} className={smallButtonClass}><Trash2 className="h-3.5 w-3.5" /></button></div>)}
      </div>
      <AssetUploader label="Optional phase image / price sheet" value={card.image} onChange={(image) => onChange({ ...data, cards: cards.map((item, i) => i === index ? { ...item, image } : item) })} />
    </div>)}
  </div>;
}

function UnitTypesEditor({ data, onChange }: { data: UnitTypesData; onChange: (data: UnitTypesData) => void }) {
  const units = data.units;
  return <div className="space-y-3">
    <div className="flex items-center justify-between text-xs text-neutral-600"><span>Units: {units.length}/30</span><button type="button" disabled={units.length >= 30} onClick={() => onChange({ units: [...units, { title: "", planImages: [], fields: [] }] })} className={smallButtonClass}><Plus className="h-3.5 w-3.5" /> Add unit type</button></div>
    {units.map((unit, index) => <div key={index} className="space-y-3 rounded-md border border-neutral-200 p-3">
      <div className="flex items-center justify-between"><strong className="text-xs text-neutral-700">Unit type {index + 1}</strong><div className="flex gap-2"><ReorderButtons index={index} count={units.length} onMove={(to) => onChange({ units: moveItem(units, index, to) })} /><button type="button" disabled={units.length <= 1} onClick={() => onChange({ units: units.filter((_, i) => i !== index) })} className={smallButtonClass}><Trash2 className="h-3.5 w-3.5" /> Remove</button></div></div>
      <TextField label="Title" value={unit.title} max={80} onChange={(title) => onChange({ units: units.map((item, i) => i === index ? { ...item, title } : item) })} />
      <div className="space-y-2"><div className="flex items-center justify-between text-xs font-medium text-neutral-700"><span>Plan images ({unit.planImages.length}/2)</span></div>
        {Array.from({ length: unit.planImages.length < 2 ? unit.planImages.length + 1 : unit.planImages.length }, (_, imageIndex) => <AssetUploader key={`${unit.title}-${imageIndex}`} label={`Floor plan ${imageIndex + 1}`} value={unit.planImages[imageIndex]} onChange={(nextImage) => onChange({ units: units.map((item, i) => i === index ? { ...item, planImages: nextImage ? imageIndex < item.planImages.length ? item.planImages.map((asset, j) => j === imageIndex ? nextImage : asset) : [...item.planImages, nextImage] : item.planImages.filter((_, j) => j !== imageIndex) } : item) })} />)}
      </div>
      <div className="space-y-2"><div className="flex items-center justify-between text-xs font-medium text-neutral-700"><span>Details ({unit.fields.length}/10)</span><button type="button" disabled={unit.fields.length >= 10} onClick={() => onChange({ units: units.map((item, i) => i === index ? { ...item, fields: [...item.fields, { label: "", value: "" }] } : item) })} className={smallButtonClass}><Plus className="h-3 w-3" /> Add detail</button></div>
        {unit.fields.map((field, fieldIndex) => <div key={fieldIndex} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto_auto] sm:items-end"><TextField label="Label" value={field.label} max={40} onChange={(label) => onChange({ units: units.map((item, i) => i === index ? { ...item, fields: item.fields.map((entry, j) => j === fieldIndex ? { ...entry, label } : entry) } : item) })} /><TextField label="Value" value={field.value} max={120} onChange={(value) => onChange({ units: units.map((item, i) => i === index ? { ...item, fields: item.fields.map((entry, j) => j === fieldIndex ? { ...entry, value } : entry) } : item) })} /><ReorderButtons index={fieldIndex} count={unit.fields.length} onMove={(to) => onChange({ units: units.map((item, i) => i === index ? { ...item, fields: moveItem(item.fields, fieldIndex, to) } : item) })} /><button type="button" onClick={() => onChange({ units: units.map((item, i) => i === index ? { ...item, fields: item.fields.filter((_, j) => j !== fieldIndex) } : item) })} className={smallButtonClass}><Trash2 className="h-3.5 w-3.5" /></button></div>)}
      </div>
    </div>)}
  </div>;
}

function TextBlockEditor({ data, onChange }: { data: TextBlockData; onChange: (data: TextBlockData) => void }) {
  return <div className="space-y-3">
    <TextField label="Subtitle (optional)" value={data.subtitle ?? ""} max={120} onChange={(subtitle) => onChange({ ...data, subtitle: subtitle || undefined })} />
    <TextField label="Body" value={data.body} max={5000} multiline onChange={(body) => onChange({ ...data, body })} />
    <label className="block text-xs font-medium text-neutral-700">Alignment<select value={data.align} onChange={(event) => onChange({ ...data, align: event.target.value as "left" | "center" })} className={inputClass}><option value="left">Left</option><option value="center">Center</option></select></label>
    <div className="space-y-2 rounded border border-neutral-200 p-3"><label className="flex items-center gap-2 text-xs font-medium text-neutral-700"><input type="checkbox" checked={Boolean(data.cta)} onChange={(event) => onChange({ ...data, cta: event.target.checked ? { label: "", href: "" } : undefined })} /> Add button</label>
      {data.cta && <div className="grid gap-3 sm:grid-cols-2"><TextField label="Button label" value={data.cta.label} max={40} onChange={(label) => onChange({ ...data, cta: { ...data.cta!, label } })} /><label className="block text-xs font-medium text-neutral-700"><span className="flex justify-between">Button URL <span className="text-neutral-400">HTTPS URL or internal /path</span></span><input type="text" value={data.cta.href} onChange={(event) => onChange({ ...data, cta: { ...data.cta!, href: event.target.value } })} className={inputClass} /></label></div>}
    </div>
  </div>;
}

function SectionEditor({ value, onChange }: { value: ReraPropertySectionData; onChange: (value: ReraPropertySectionData) => void }) {
  return <div className="space-y-4 border-t border-neutral-200 pt-4">
    <TextField label="Section title (optional)" value={value.title ?? ""} max={120} onChange={(title) => onChange({ ...value, title: title || null } as ReraPropertySectionData)} />
    {value.type === "INFO_CARDS" && <InfoCardsEditor data={value.data} onChange={(data) => onChange({ ...value, data })} />}
    {value.type === "PHASE_CARDS" && <PhaseCardsEditor data={value.data} onChange={(data) => onChange({ ...value, data })} />}
    {value.type === "UNIT_TYPES" && <UnitTypesEditor data={value.data} onChange={(data) => onChange({ ...value, data })} />}
    {value.type === "TEXT_BLOCK" && <TextBlockEditor data={value.data} onChange={(data) => onChange({ ...value, data })} />}
  </div>;
}

export function PageSectionsPanel({ propertyId, initialSections }: { propertyId?: string; initialSections?: PageSectionRow[] }) {
  const router = useRouter();
  const sections = [...(initialSections ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const [addType, setAddType] = useState<ReraPropertySectionData["type"]>("INFO_CARDS");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReraPropertySectionData | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const runAction = async (action: () => Promise<{ success: boolean; error?: string }>, successMessage?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await action();
      if (!result.success) {
        setMessage({ kind: "error", text: result.error ?? "The action could not be completed." });
        return false;
      }
      if (successMessage) setMessage({ kind: "success", text: successMessage });
      router.refresh();
      return true;
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "The action could not be completed." });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const addSection = async () => {
    if (!propertyId) return;
    if (sections.length >= 20) {
      setMessage({ kind: "error", text: "A property can have no more than 20 sections." });
      return;
    }
    const section = makeSection(addType);
    const ok = await runAction(() => createSection({ propertyId, section }), "Section added.");
    if (ok) setExpandedId("newest");
  };

  const beginEdit = (row: PageSectionRow) => {
    const parsed = reraPropertySectionSchema.safeParse({ ...row, data: row.data });
    if (!parsed.success) {
      setMessage({ kind: "error", text: "This section has invalid saved data and cannot be edited. Delete it and create a new section." });
      return;
    }
    setDraft(parsed.data);
    setEditingId(row.id);
    setExpandedId(row.id);
    setMessage(null);
  };

  const saveSection = async (sectionId: string) => {
    if (!propertyId || !draft) return;
    const parsed = reraPropertySectionSchema.safeParse(draft);
    if (!parsed.success) {
      setMessage({ kind: "error", text: parsed.error.issues.map((issue) => issue.message).join("; ") });
      return;
    }
    const ok = await runAction(() => updateSection({ propertyId, sectionId, section: parsed.data }), "Section saved.");
    if (ok) { setEditingId(null); setDraft(null); }
  };

  const changeOrder = async (index: number, targetIndex: number) => {
    if (!propertyId || targetIndex < 0 || targetIndex >= sections.length) return;
    const ids = sections.map((section) => section.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(targetIndex, 0, moved);
    await runAction(() => reorderSections({ propertyId, sectionIds: ids }));
  };

  return <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 sm:p-5">
    <div className="flex flex-col gap-2 border-b border-neutral-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-lg font-semibold text-neutral-900">Page Sections</h2><p className="mt-0.5 text-xs text-neutral-500">Build ordered content blocks for the public property detail page. Maximum 20 sections.</p></div>
      {propertyId ? <div className="flex gap-2"><select value={addType} onChange={(event) => setAddType(event.target.value as ReraPropertySectionData["type"])} disabled={busy || sections.length >= 20} className="min-h-9 rounded border border-neutral-300 px-2 text-xs"><option value="INFO_CARDS">Highlight Cards</option><option value="PHASE_CARDS">Tower / Phase Cards</option><option value="UNIT_TYPES">Unit Types with Floor Plans</option><option value="TEXT_BLOCK">Text Block</option></select><button type="button" onClick={addSection} disabled={busy || sections.length >= 20} className="inline-flex min-h-9 items-center gap-1.5 rounded bg-neutral-900 px-3 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"><Plus className="h-3.5 w-3.5" /> Add section</button></div> : null}
    </div>

    {!propertyId ? <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Save the property first to add page sections.</p> : sections.length === 0 ? <p className="rounded border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500">No page sections yet. Add one above.</p> : <div className="space-y-2">
      {sections.map((section, index) => {
        const typeLabel = SectionTypes.find((item) => item.type === section.type)?.label ?? section.type;
        const isExpanded = expandedId === section.id || expandedId === "newest" && index === sections.length - 1;
        const isEditing = editingId === section.id;
        return <article key={section.id} className="rounded-md border border-neutral-200">
          <div className="flex flex-wrap items-center gap-2 p-3">
            <button type="button" onClick={() => setExpandedId(isExpanded ? null : section.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
              {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              <span className="min-w-0"><strong className="block truncate text-sm text-neutral-900">{typeLabel}</strong><span className="block truncate text-xs text-neutral-500">{section.title?.trim() || "Untitled section"}</span></span>
            </button>
            <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700"><input type="checkbox" checked={section.isPublished} disabled={busy} onChange={(event) => void runAction(() => toggleSectionPublished({ propertyId, sectionId: section.id, isPublished: event.target.checked }))} className="rounded border-neutral-300" /> Published</label>
            <ReorderButtons index={index} count={sections.length} onMove={(to) => void changeOrder(index, to)} />
            <button type="button" onClick={() => isEditing ? (setEditingId(null), setDraft(null)) : beginEdit(section)} disabled={busy} className={smallButtonClass}>{isEditing ? "Cancel edit" : "Edit"}</button>
            <button type="button" onClick={() => {
              if (window.confirm("Delete this section and its section images?")) void runAction(() => deleteSection({ propertyId, sectionId: section.id }), "Section deleted.");
            }} disabled={busy} className="inline-flex min-h-9 items-center gap-1.5 rounded border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          </div>
          {isExpanded && <div className="space-y-3 border-t border-neutral-200 p-3">
            {!isEditing ? <p className="text-xs text-neutral-500">{section.isPublished ? "This section is visible on the public property page." : "This section is hidden from the public page."}</p>
              : draft ? <><SectionEditor value={draft} onChange={setDraft} /><div className="flex justify-end"><button type="button" onClick={() => void saveSection(section.id)} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save section</button></div></>
              : null}
          </div>}
        </article>;
      })}
    </div>}
    {busy && <p className="flex items-center gap-2 text-xs text-neutral-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving changes…</p>}
    {message && <p role="status" className={`rounded border p-3 text-sm ${message.kind === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{message.text}</p>}
  </section>;
}
