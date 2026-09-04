"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ImageIcon,
} from "lucide-react";
import {
  createHomeGalleryImagesAction,
  updateHomeGalleryImageAction,
  deleteHomeGalleryImageAction,
  reorderHomeGalleryImagesAction,
  type HomeGalleryImageInput,
} from "../actions";

export interface HomeGalleryItem {
  id: string;
  title: string;
  altText: string | null;
  url: string;
  cloudinaryId: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
}

interface HomeGalleryManagerProps {
  initialImages: HomeGalleryItem[];
}

export function HomeGalleryManager({ initialImages }: HomeGalleryManagerProps) {
  const router = useRouter();
  const [images, setImages] = useState<HomeGalleryItem[]>(initialImages);
  const [isPending, startTransition] = useTransition();

  // Upload State
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingTitles, setEditingTitles] = useState<Record<string, string>>({});

  const remainingSlots = Math.max(0, 15 - images.length);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg(null);
    } else {
      setSuccessMsg(msg);
      setErrorMsg(null);
    }
    setTimeout(() => {
      setErrorMsg(null);
      setSuccessMsg(null);
    }, 4000);
  };

  // Direct Signed Upload to Cloudinary (handles single & multiple files)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > remainingSlots) {
      showNotification(
        `Limit exceeded! You can only add ${remainingSlots} more image(s). (Max 15 total)`,
        true
      );
      e.target.value = "";
      return;
    }

    setUploadingFiles(true);
    setErrorMsg(null);

    const uploadedNewItems: HomeGalleryImageInput[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 1. Get signature from /api/cloudinary/sign
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "realspace-home-gallery" }),
        });

        const signData = await signRes.json();
        if (!signRes.ok || !signData.signature) {
          throw new Error(signData.error || "Failed to generate Cloudinary signature.");
        }

        // 2. Upload file directly to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signData.apiKey);
        formData.append("timestamp", signData.timestamp.toString());
        formData.append("signature", signData.signature);
        formData.append("folder", signData.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.secure_url) {
          throw new Error(uploadData.error?.message || `Upload failed for ${file.name}`);
        }

        // Auto-generate title from filename
        const rawName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        const formattedTitle = rawName
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase());

        uploadedNewItems.push({
          title: formattedTitle,
          altText: `${formattedTitle} — REALSPACE Home Design`,
          url: uploadData.secure_url,
          cloudinaryId: uploadData.public_id,
          sortOrder: images.length + i,
          isPublished: true,
        });
      }

      // 3. Save uploaded items to Prisma DB
      const result = await createHomeGalleryImagesAction(uploadedNewItems);
      if (!result.success) {
        showNotification(result.error || "Failed to save uploaded images to database.", true);
      } else {
        if (result.createdImages && result.createdImages.length > 0) {
          const formattedNewItems: HomeGalleryItem[] = result.createdImages.map((img: any) => ({
            id: img.id,
            title: img.title,
            altText: img.altText,
            url: img.url,
            cloudinaryId: img.cloudinaryId,
            sortOrder: img.sortOrder,
            isPublished: img.isPublished,
            createdAt: new Date(img.createdAt),
          }));
          setImages((prev) => [...prev, ...formattedNewItems]);
        }
        showNotification(`Successfully uploaded ${uploadedNewItems.length} image(s)!`);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      showNotification(err.message || "An error occurred during file upload.", true);
    } finally {
      setUploadingFiles(false);
      e.target.value = "";
    }
  };

  // Save Title edit
  const handleSaveTitle = (id: string) => {
    const newTitle = editingTitles[id];
    if (!newTitle || !newTitle.trim()) return;

    startTransition(async () => {
      const res = await updateHomeGalleryImageAction(id, { title: newTitle.trim() });
      if (res.success) {
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, title: newTitle.trim() } : img))
        );
        showNotification("Title updated!");
        const copy = { ...editingTitles };
        delete copy[id];
        setEditingTitles(copy);
      } else {
        showNotification(res.error || "Failed to update title.", true);
      }
    });
  };

  // Toggle Publish Status
  const handleTogglePublish = (id: string, currentVal: boolean) => {
    startTransition(async () => {
      const res = await updateHomeGalleryImageAction(id, { isPublished: !currentVal });
      if (res.success) {
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, isPublished: !currentVal } : img))
        );
        showNotification(`Image ${!currentVal ? "published" : "hidden"}.`);
      } else {
        showNotification(res.error || "Failed to toggle status.", true);
      }
    });
  };

  // Delete Image
  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from the Home Gallery?`)) return;

    startTransition(async () => {
      const res = await deleteHomeGalleryImageAction(id);
      if (res.success) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        showNotification(`Deleted "${title}".`);
      } else {
        showNotification(res.error || "Failed to delete image.", true);
      }
    });
  };

  // Move Image Order (Up / Down)
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    // Update sortOrder values
    const reordered = newImages.map((img, i) => ({ ...img, sortOrder: i }));
    setImages(reordered);

    startTransition(async () => {
      const payload = reordered.map((img) => ({ id: img.id, sortOrder: img.sortOrder }));
      const res = await reorderHomeGalleryImagesAction(payload);
      if (res.success) {
        showNotification("Sort order updated!");
      } else {
        showNotification(res.error || "Failed to save order.", true);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Limit Bar */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">Home Gallery Slider</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full">
              Max 15 Images
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Manage the high-resolution image carousel showcased on the home page.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2.5 rounded-lg border border-neutral-200">
          <div className="text-right">
            <div className="text-xs text-neutral-500 font-medium">Uploaded Slots</div>
            <div className="text-sm font-bold text-neutral-900">
              {images.length} <span className="text-neutral-400 font-normal">/ 15</span>
            </div>
          </div>
          <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                images.length >= 15 ? "bg-amber-500" : "bg-brand-red"
              }`}
              style={{ width: `${Math.min(100, (images.length / 15) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action Bar (Uploads) */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-brand-red" /> Upload New Images
        </h2>

        {remainingSlots > 0 ? (
          <div className="flex flex-wrap items-center gap-4">
            {/* File Upload Button */}
            <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-red hover:bg-red-800 rounded-lg cursor-pointer transition-colors shadow-xs">
              {uploadingFiles ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Cloudinary...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Select Image Files (Up to {remainingSlots})
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={uploadingFiles || isPending}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs sm:text-sm font-medium">
            Maximum limit reached (15/15 images). To add new photos, please delete an existing image below first.
          </div>
        )}
      </div>

      {/* Image Grid Listing */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-brand-red" /> Active Home Gallery Images ({images.length})
        </h2>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {images.map((img, index) => {
              const currentTitle = editingTitles[img.id] !== undefined ? editingTitles[img.id] : img.title;

              return (
                <div
                  key={img.id}
                  className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-all ${
                    img.isPublished ? "border-neutral-200" : "border-neutral-200 opacity-60 bg-neutral-50"
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-full aspect-[16/10] bg-neutral-900 overflow-hidden">
                    <Image
                      src={img.url}
                      alt={img.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />

                    {/* Order Badge (Top Left) */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2.5 py-1 text-xs font-bold text-white bg-black/60 backdrop-blur-md rounded-md border border-white/20">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Published Status Badge (Top Right) */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(img.id, img.isPublished)}
                        disabled={isPending}
                        className={`p-1.5 rounded-md backdrop-blur-md transition-colors cursor-pointer ${
                          img.isPublished
                            ? "bg-emerald-600/90 text-white hover:bg-emerald-700"
                            : "bg-neutral-800/90 text-neutral-300 hover:bg-neutral-900"
                        }`}
                        title={img.isPublished ? "Published (Click to hide)" : "Hidden (Click to publish)"}
                      >
                        {img.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Title & Controls Footer */}
                  <div className="p-4 space-y-3 bg-white">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                        Title / Caption
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={currentTitle}
                          onChange={(e) =>
                            setEditingTitles((prev) => ({ ...prev, [img.id]: e.target.value }))
                          }
                          placeholder="Image title..."
                          className="w-full text-xs font-semibold text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 focus:bg-white focus:ring-1 focus:ring-brand-red outline-none"
                        />
                        {editingTitles[img.id] !== undefined && editingTitles[img.id] !== img.title && (
                          <button
                            type="button"
                            onClick={() => handleSaveTitle(img.id)}
                            disabled={isPending}
                            className="p-1.5 text-white bg-brand-red hover:bg-red-800 rounded-md transition-colors cursor-pointer shrink-0"
                            title="Save Title"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sorting & Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                      {/* Sort Order Move */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0 || isPending}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-neutral-100 disabled:opacity-40 rounded-md transition-colors cursor-pointer"
                          title="Move Left/Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={index === images.length - 1 || isPending}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-neutral-100 disabled:opacity-40 rounded-md transition-colors cursor-pointer"
                          title="Move Right/Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(img.id, img.title)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-300 p-6">
            <ImageIcon className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-neutral-800">No Custom Home Gallery Images</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
              Currently showing default static images on the home page slider. Upload custom photos above to override with your studio&apos;s latest home designs!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
