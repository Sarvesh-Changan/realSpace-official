"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Play,
  Film,
  Image as ImageIcon,
  Copy,
  Filter,
} from "lucide-react";
import { toggleGalleryItemPublish, deleteGalleryItem } from "../actions";
import { RERA_GALLERY_CATEGORIES } from "../schema";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";

function formatFileSize(bytes?: number | null): string {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface GalleryItemRow {
  id: string;
  title: string;
  category: "RESIDENTIAL" | "COMMERCIAL" | "ONGOING" | "HANDOVER" | "OTHER";
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  publicId?: string | null;
  thumbnailUrl?: string | null;
  thumbnailPublicId?: string | null;
  fileSizeBytes?: number | null;
  cloudinaryEtag?: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date | string;
}

export function GalleryTableClient({ items }: { items: GalleryItemRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState<boolean>(false);

  // Calculate etag frequencies across all gallery items for duplicate detection
  const etagCounts: Record<string, number> = {};
  items.forEach((item) => {
    if (item.cloudinaryEtag) {
      etagCounts[item.cloudinaryEtag] = (etagCounts[item.cloudinaryEtag] || 0) + 1;
    }
  });

  const duplicateCountAll = items.filter(
    (item) => item.cloudinaryEtag && etagCounts[item.cloudinaryEtag] > 1
  ).length;

  // Filter items based on category and duplicate toggle
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    const isDuplicate = Boolean(
      item.cloudinaryEtag && etagCounts[item.cloudinaryEtag] > 1
    );
    const matchesDuplicates = showOnlyDuplicates ? isDuplicate : true;

    return matchesCategory && matchesDuplicates;
  });

  const handleTogglePublish = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleGalleryItemPublish(id, !current);
      router.refresh();
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete gallery item "${title}"? This will delete the media asset from Cloudinary.`)) {
      startTransition(async () => {
        await deleteGalleryItem(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-neutral-800" /> RERA Gallery
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage property gallery photos, handover visuals, and walkthrough videos.
          </p>
        </div>

        <Link
          href="/admin/rera/gallery/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Bulk Upload Media
        </Link>
      </div>

      {/* Filter Bar: Categories + Duplicate Detection */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedCategory === "ALL"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            All ({items.length})
          </button>
          {RERA_GALLERY_CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat.value).length;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat.value
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Duplicate detection toggle */}
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOnlyDuplicates}
              onChange={(e) => setShowOnlyDuplicates(e.target.checked)}
              className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500 cursor-pointer h-4 w-4"
            />
            <span className="flex items-center gap-1">
              <Copy className="w-3.5 h-3.5 text-amber-600" />
              Show Only Duplicates
              {duplicateCountAll > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                  {duplicateCountAll}
                </span>
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Gallery Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-4">
            <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-900">
              No gallery items found
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              {showOnlyDuplicates
                ? "No duplicate files found matching this category filter."
                : "Upload photos or project videos to showcase in the RERA gallery."}
            </p>
            {!showOnlyDuplicates && (
              <div className="mt-6">
                <Link
                  href="/admin/rera/gallery/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Bulk Upload Media
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Media</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">File Size</th>
                  <th className="py-3.5 px-4">Sort Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {filteredItems.map((item) => {
                  const isVideo = item.mediaType === "VIDEO";
                  const thumbUrl = isVideo
                    ? item.thumbnailUrl || getVideoThumbnailUrl(item.url, "VIDEO")
                    : item.url;
                  const isDuplicate = Boolean(
                    item.cloudinaryEtag && etagCounts[item.cloudinaryEtag] > 1
                  );

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isDuplicate
                          ? "bg-amber-50/60 hover:bg-amber-50"
                          : "hover:bg-neutral-50/50"
                      }`}
                    >
                      {/* Media Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-14 h-14 rounded bg-neutral-900 border border-neutral-200 relative overflow-hidden shrink-0">
                          {isVideo ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              {thumbUrl && !thumbUrl.match(/\.(mp4|mov|webm|ogv|m4v)/i) ? (
                                <Image
                                  src={thumbUrl}
                                  alt={item.title}
                                  fill
                                  sizes="56px"
                                  className="object-cover opacity-80"
                                  unoptimized={!thumbUrl.includes("res.cloudinary.com")}
                                />
                              ) : null}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-5 h-5 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center shadow">
                                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Image
                              src={item.url}
                              alt={item.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                              unoptimized={!item.url.includes("res.cloudinary.com")}
                            />
                          )}
                        </div>
                      </td>

                      {/* Title & ETag Details */}
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="space-y-1">
                          <div className="font-semibold text-neutral-900">
                            {item.title}
                          </div>
                          {isDuplicate && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded">
                              <Copy className="w-3 h-3" /> Duplicate ETag (
                              {etagCounts[item.cloudinaryEtag || ""]})
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {item.category}
                        </span>
                      </td>

                      {/* Media Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium uppercase ${
                            isVideo
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isVideo ? (
                            <>
                              <Film className="w-3 h-3" /> Video
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3" /> Image
                            </>
                          )}
                        </span>
                      </td>

                      {/* File Size */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-neutral-600 font-mono">
                        {formatFileSize(item.fileSizeBytes)}
                      </td>

                      {/* Sort Order */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-neutral-600 font-mono">
                        {item.sortOrder}
                      </td>

                      {/* Published Toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 select-none">
                          <input
                            type="checkbox"
                            checked={item.isPublished}
                            onChange={() => handleTogglePublish(item.id, item.isPublished)}
                            disabled={isPending}
                            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 disabled:opacity-50 cursor-pointer h-4 w-4"
                          />
                          <span>{item.isPublished ? "Published" : "Draft"}</span>
                        </label>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/rera/gallery/${item.id}/edit`}
                            className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={isPending}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Item"
                          >
                            {isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
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
  );
}

