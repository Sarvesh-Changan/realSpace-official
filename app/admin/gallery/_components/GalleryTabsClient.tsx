"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FolderHeart, Image as ImageIcon, Plus, Edit, Trash2, Filter, RotateCcw, Copy, RefreshCw } from "lucide-react";
import Image from "next/image";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";
import { deleteCategory, deleteImage, toggleImageStatus, syncGalleryMediaSizes } from "../actions";
import { CategoryForm } from "./CategoryForm";
import { ImageForm } from "./ImageForm";
import type { CategoryInput, ImageInput } from "../schema";

function formatFileSize(bytes?: number | null): string {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function GalleryTabsClient({
  categories,
  images,
}: {
  categories: any[];
  images: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<"categories" | "images">("images");

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInput | null>(null);

  const [imageFormOpen, setImageFormOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageInput | null>(null);

  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
  const [isSyncingLegacy, setIsSyncingLegacy] = useState(false);

  const legacyCount = images.filter((img) => img.fileSizeBytes === null || img.fileSizeBytes === undefined).length;

  const handleSyncLegacy = async () => {
    setIsSyncingLegacy(true);
    try {
      const res = await syncGalleryMediaSizes();
      if (res.success) {
        router.refresh();
        alert(res.message || "Successfully updated file size metadata for previous uploads.");
      } else {
        alert(res.error || "Failed to sync legacy metadata.");
      }
    } catch (err) {
      console.error("Failed to sync legacy metadata:", err);
      alert("An error occurred while syncing file sizes.");
    } finally {
      setIsSyncingLegacy(false);
    }
  };

  const selectedCategoryId = searchParams.get("category") || "all";

  // Calculate etag frequencies for duplicate detection across all images
  const etagCounts: Record<string, number> = {};
  images.forEach((img) => {
    if (img.cloudinaryEtag) {
      etagCounts[img.cloudinaryEtag] = (etagCounts[img.cloudinaryEtag] || 0) + 1;
    }
  });

  const duplicateCountAll = images.filter(
    (img) => img.cloudinaryEtag && etagCounts[img.cloudinaryEtag] > 1
  ).length;

  const handleCategorySelect = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catId === "all") {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filteredImages = images.filter((img) => {
    const matchesCategory =
      selectedCategoryId === "all" ||
      img.categoryId === selectedCategoryId ||
      img.category?.id === selectedCategoryId ||
      img.category?.name.toLowerCase() === selectedCategoryId.toLowerCase();

    const isDuplicate = Boolean(img.cloudinaryEtag && etagCounts[img.cloudinaryEtag] > 1);
    const matchesDuplicateFilter = showOnlyDuplicates ? isDuplicate : true;

    return matchesCategory && matchesDuplicateFilter;
  });

  const selectedCatObj = categories.find(
    (c) => c.id === selectedCategoryId || c.name.toLowerCase() === selectedCategoryId.toLowerCase()
  );

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? All associated images will be deleted.")) {
      await deleteCategory(id);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      await deleteImage(id);
    }
  };

  const handleToggle = async (id: string, field: "isFeatured" | "isPublished" | "isCategoryCover", currentValue: boolean) => {
    await toggleImageStatus(id, field, !currentValue);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-brand-red" /> Gallery Management
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your inspiration gallery categories and media.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "categories" ? (
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-brand-red text-white font-medium text-sm rounded-md hover:bg-brand-red/90 transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          ) : (
            <>
              {legacyCount > 0 && (
                <button
                  onClick={handleSyncLegacy}
                  disabled={isSyncingLegacy}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-300 font-medium text-sm rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  title="Fetch file size and content hash for images uploaded prior to this update"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingLegacy ? "animate-spin text-brand-red" : ""}`} />
                  {isSyncingLegacy ? "Fetching Sizes..." : `Fetch Previous Sizes (${legacyCount})`}
                </button>
              )}
              <button
                onClick={() => {
                  setEditingImage(null);
                  setImageFormOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-brand-red text-white font-medium text-sm rounded-md hover:bg-brand-red/90 transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" /> Add Image
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-200 pb-1">
        <button
          onClick={() => {
            setActiveTab("categories");
            setImageFormOpen(false);
          }}
          className={`flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "categories"
              ? "border-brand-red text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <FolderHeart className="w-4 h-4" />
          Categories
        </button>
        <button
          onClick={() => {
            setActiveTab("images");
            setCategoryFormOpen(false);
          }}
          className={`flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "images"
              ? "border-brand-red text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Images
        </button>
      </div>

      {activeTab === "categories" && (
        <div className="space-y-6">
          {categoryFormOpen && (
            <CategoryForm
              initialData={editingCategory || undefined}
              onSuccess={() => {
                setCategoryFormOpen(false);
                setEditingCategory(null);
              }}
              onCancel={() => {
                setCategoryFormOpen(false);
                setEditingCategory(null);
              }}
            />
          )}

          {!categoryFormOpen && (
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
              {categories.length === 0 ? (
                <div className="text-center py-12 px-4 text-neutral-500">No categories found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[480px]">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Name</th>
                        <th className="py-3.5 px-4">Sort Order</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-sm">
                      {categories.map((c) => (
                        <tr key={c.id} className="hover:bg-neutral-50/50">
                          <td className="py-4 px-4 font-medium text-neutral-900">{c.name}</td>
                          <td className="py-4 px-4 text-neutral-500">{c.sortOrder}</td>
                          <td className="py-4 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingCategory(c);
                                setCategoryFormOpen(true);
                              }}
                              className="inline-flex items-center justify-center p-2 min-h-[36px] min-w-[36px] text-neutral-500 hover:text-brand-red bg-white border border-neutral-200 rounded shadow-xs hover:border-brand-red/50 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              className="inline-flex items-center justify-center p-2 min-h-[36px] min-w-[36px] text-neutral-500 hover:text-red-600 bg-white border border-neutral-200 rounded shadow-xs hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "images" && (
        <div className="space-y-6">
          {imageFormOpen && (
            <ImageForm
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
              initialData={editingImage || undefined}
              onSuccess={() => {
                setImageFormOpen(false);
                setEditingImage(null);
              }}
              onCancel={() => {
                setImageFormOpen(false);
                setEditingImage(null);
              }}
            />
          )}

          {!imageFormOpen && (
            <div className="space-y-4">
              {/* Category & Duplicate Filter Controls */}
              <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  <Filter className="w-4 h-4 text-brand-red shrink-0" />
                  <span>Filter Options:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("all")}
                    className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      selectedCategoryId === "all" || !selectedCategoryId
                        ? "bg-brand-red text-white shadow-xs font-bold"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                    }`}
                  >
                    All Categories ({images.length})
                  </button>

                  {categories.map((cat) => {
                    const catCount = images.filter(
                      (img) => img.categoryId === cat.id || img.category?.id === cat.id
                    ).length;
                    const isSelected =
                      selectedCategoryId === cat.id ||
                      selectedCategoryId?.toLowerCase() === cat.name.toLowerCase();

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-brand-red text-white shadow-xs font-bold"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                        }`}
                      >
                        {cat.name} ({catCount})
                      </button>
                    );
                  })}

                  <div className="h-6 w-px bg-neutral-200 mx-1 hidden sm:block" />

                  {/* Duplicate Filter Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowOnlyDuplicates((prev) => !prev)}
                    className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      showOnlyDuplicates
                        ? "bg-amber-600 text-white shadow-xs font-bold"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300"
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Show Only Duplicates ({duplicateCountAll})
                  </button>
                </div>
              </div>

              {/* Images Table */}
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                {filteredImages.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <p className="text-sm text-neutral-500 font-medium">
                      {showOnlyDuplicates
                        ? selectedCategoryId === "all"
                          ? "No duplicate images detected."
                          : `No duplicate images detected in category "${selectedCatObj?.name || "selected"}".`
                        : selectedCategoryId === "all"
                        ? "No images found."
                        : `No images found in category "${selectedCatObj?.name || "selected"}".`}
                    </p>
                    {(selectedCategoryId !== "all" || showOnlyDuplicates) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleCategorySelect("all");
                          setShowOnlyDuplicates(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-red hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          <th className="py-3.5 px-4">Image</th>
                          <th className="py-3.5 px-4">Title & Category</th>
                          <th className="py-3.5 px-4">Type</th>
                          <th className="py-3.5 px-4">Size</th>
                          <th className="py-3.5 px-4">Status & Cover</th>
                          <th className="py-3.5 px-4">Order</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 text-sm">
                        {filteredImages.map((img) => {
                          const isDuplicate = Boolean(img.cloudinaryEtag && etagCounts[img.cloudinaryEtag] > 1);

                          return (
                            <tr
                              key={img.id}
                              className={
                                isDuplicate
                                  ? "bg-amber-50/60 hover:bg-amber-100/50 border-l-4 border-l-amber-500"
                                  : "hover:bg-neutral-50/50"
                              }
                            >
                              <td className="py-4 px-4">
                                <div className="w-24 h-[72px] rounded bg-neutral-100 border border-neutral-200 relative overflow-hidden flex-shrink-0">
                                  <Image
                                    src={getVideoThumbnailUrl(img.url, img.mediaType)}
                                    alt={img.title}
                                    fill
                                    className="object-cover"
                                    unoptimized={img.mediaType === "VIDEO"}
                                  />
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-medium text-neutral-900">{img.title}</div>
                                <div className="text-xs text-neutral-500">{img.category?.name}</div>
                                {isDuplicate && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 rounded text-[11px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                                    <Copy className="w-3 h-3 text-amber-700" /> Possible Duplicate
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4 space-y-1">
                                <div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                    {img.designType}
                                  </span>
                                </div>
                                <div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                    {img.mediaType}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-xs font-mono font-medium text-neutral-700">
                                {formatFileSize(img.fileSizeBytes)}
                              </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center cursor-pointer group min-h-[32px]">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={img.isCategoryCover ?? false}
                                    onChange={() => handleToggle(img.id, "isCategoryCover", img.isCategoryCover)}
                                  />
                                  <div
                                    className={`block w-8 h-4.5 rounded-full transition-colors ${
                                      img.isCategoryCover ? "bg-amber-600" : "bg-neutral-300"
                                    }`}
                                  ></div>
                                  <div
                                    className={`dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                      img.isCategoryCover ? "transform translate-x-3.5" : ""
                                    }`}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs font-medium text-neutral-600 group-hover:text-neutral-900">
                                  Category Cover
                                </span>
                              </label>
                              <label className="flex items-center cursor-pointer group min-h-[32px]">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={img.isFeatured}
                                    onChange={() => handleToggle(img.id, "isFeatured", img.isFeatured)}
                                  />
                                  <div
                                    className={`block w-8 h-4.5 rounded-full transition-colors ${
                                      img.isFeatured ? "bg-brand-red" : "bg-neutral-300"
                                    }`}
                                  ></div>
                                  <div
                                    className={`dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                      img.isFeatured ? "transform translate-x-3.5" : ""
                                    }`}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs font-medium text-neutral-600 group-hover:text-neutral-900">
                                  Featured
                                </span>
                              </label>
                              <label className="flex items-center cursor-pointer group min-h-[32px]">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={img.isPublished}
                                    onChange={() => handleToggle(img.id, "isPublished", img.isPublished)}
                                  />
                                  <div
                                    className={`block w-8 h-4.5 rounded-full transition-colors ${
                                      img.isPublished ? "bg-brand-red" : "bg-neutral-300"
                                    }`}
                                  ></div>
                                  <div
                                    className={`dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                      img.isPublished ? "transform translate-x-3.5" : ""
                                    }`}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs font-medium text-neutral-600 group-hover:text-neutral-900">
                                  Published
                                </span>
                              </label>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-neutral-500 font-mono">{img.sortOrder}</td>
                          <td className="py-4 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingImage({
                                  ...img,
                                  categoryId: img.categoryId,
                                  isCategoryCover: img.isCategoryCover ?? false,
                                });
                                setImageFormOpen(true);
                              }}
                              className="inline-flex items-center justify-center p-2 min-h-[36px] min-w-[36px] text-neutral-500 hover:text-brand-red bg-white border border-neutral-200 rounded shadow-xs hover:border-brand-red/50 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(img.id)}
                              className="inline-flex items-center justify-center p-2 min-h-[36px] min-w-[36px] text-neutral-500 hover:text-red-600 bg-white border border-neutral-200 rounded shadow-xs hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}
    </div>
  );
}
