"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Edit, Plus, Trash2, X } from "lucide-react";
import {
  createPropertyCategory,
  deletePropertyCategory,
  togglePropertyCategoryPublished,
  updatePropertyCategory,
} from "../actions";
import type { ReraPropertyCategoryInput } from "../schema";

type CategoryRow = ReraPropertyCategoryInput & { id: string; _count: { properties: number } };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

const inputClass = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

export function PropertyCategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setSlugEdited(false);
    setSortOrder(0);
    setIsPublished(true);
    setError(null);
    setFormOpen(true);
  };

  const openEdit = (category: CategoryRow) => {
    setEditing(category);
    setName(category.name);
    setSlug(category.slug);
    setSlugEdited(false);
    setSortOrder(category.sortOrder);
    setIsPublished(category.isPublished);
    setError(null);
    setFormOpen(true);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    const data = { name, slug, sortOrder: Number(sortOrder), isPublished };
    try {
      const result = editing
        ? await updatePropertyCategory(editing.id, data)
        : await createPropertyCategory(data);
      if (!result.success) {
        setError(result.error ?? "Could not save category.");
        return;
      }
      setFormOpen(false);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublished = async (category: CategoryRow) => {
    const result = await togglePropertyCategoryPublished(category.id, !category.isPublished);
    if (!result.success) setError(result.error ?? "Could not update category.");
    else router.refresh();
  };

  const removeCategory = async (category: CategoryRow) => {
    if (!window.confirm(`Delete the ${category.name} category?`)) return;
    const result = await deletePropertyCategory(category.id);
    if (!result.success) setError(result.error ?? "Could not delete category.");
    else router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Property Categories</h2>
          <p className="text-sm text-neutral-500">Manage categories shown in property forms and public filters.</p>
        </div>
        {!formOpen && (
          <button onClick={openCreate} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {error && !formOpen && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {formOpen && (
        <form onSubmit={save} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">{editing ? "Edit Category" : "Add Category"}</h3>
            <button type="button" onClick={() => setFormOpen(false)} aria-label="Close category form" className="rounded p-1 text-neutral-500 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
          </div>
          {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-neutral-700">Name
              <input required minLength={2} maxLength={40} value={name} onChange={(event) => {
                const value = event.target.value;
                setName(value);
                if (!slugEdited) setSlug(slugify(value));
              }} className={inputClass} />
            </label>
            <label className="space-y-1 text-sm font-medium text-neutral-700">Slug
              <input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => {
                setSlug(event.target.value);
                setSlugEdited(true);
              }} className={`${inputClass} font-mono`} />
            </label>
            <label className="space-y-1 text-sm font-medium text-neutral-700">Sort order
              <input type="number" step="1" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className={inputClass} />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
              <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} /> Published
            </label>
          </div>
          <div className="flex gap-2">
            <button disabled={isSaving} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{isSaving ? "Saving..." : editing ? "Save Changes" : "Create Category"}</button>
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        {categories.length === 0 ? <p className="py-10 text-center text-sm text-neutral-500">No categories yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead><tr className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Properties</th><th className="px-4 py-3">Published</th><th className="px-4 py-3">Sort order</th><th className="px-4 py-3 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-neutral-100">
                {categories.map((category) => <tr key={category.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{category.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600">{category.slug}</td>
                  <td className="px-4 py-3 text-neutral-700">{category._count.properties}</td>
                  <td className="px-4 py-3"><button type="button" role="switch" aria-checked={category.isPublished} aria-label={`${category.isPublished ? "Unpublish" : "Publish"} ${category.name}`} onClick={() => void togglePublished(category)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${category.isPublished ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-600"}`}>{category.isPublished ? "Published" : "Unpublished"}</button></td>
                  <td className="px-4 py-3 text-neutral-700">{category.sortOrder}</td>
                  <td className="px-4 py-3 text-right"><div className="inline-flex gap-1">
                    <button type="button" onClick={() => openEdit(category)} aria-label={`Edit ${category.name}`} className="rounded border border-neutral-200 p-2 text-neutral-600 hover:text-neutral-900"><Edit className="h-4 w-4" /></button>
                    <button type="button" onClick={() => void removeCategory(category)} aria-label={`Delete ${category.name}`} className="rounded border border-neutral-200 p-2 text-neutral-600 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
