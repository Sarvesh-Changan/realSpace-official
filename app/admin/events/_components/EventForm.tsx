"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Loader2,
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  Film,
  Plus,
  AlertCircle,
  Eye,
  Check,
} from "lucide-react";
import { eventSchema, type EventInput } from "../schema";
import { createEvent, updateEvent } from "../actions";

interface EventFormProps {
  mode: "create" | "update";
  eventId?: string;
  initialData?: Partial<EventInput>;
}

export function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<EventInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      coverImageUrl: initialData?.coverImageUrl || "",
      coverImagePublicId: initialData?.coverImagePublicId || "",
      isPublished: initialData?.isPublished ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
      media: initialData?.media || [],
    },
  });

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control,
    name: "media",
  });

  const titleValue = watch("title");
  const coverImageUrl = watch("coverImageUrl");

  // Auto-generate slug from title if user hasn't explicitly customized slug or on initial title input
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val);
    if (mode === "create") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", generatedSlug);
    }
  };

  // Upload Cover Image directly to Cloudinary
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCoverUploading(true);
    setServerError(null);

    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "realspace-events" }),
      });

      if (!signRes.ok) {
        const errJson = await signRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to get upload signature.");
      }

      const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const targetCloud = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dipeupebc";

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${targetCloud}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json().catch(() => ({}));
        throw new Error(uploadErr.error?.message || "Cloudinary cover image upload failed.");
      }

      const uploadData = await uploadRes.json();

      setValue("coverImageUrl", uploadData.secure_url || uploadData.url);
      setValue("coverImagePublicId", uploadData.public_id);
    } catch (err: any) {
      console.error("Cover upload error:", err);
      setServerError(err.message || "Failed to upload cover image.");
    } finally {
      setIsCoverUploading(false);
    }
  };

  // Upload Multiple Gallery Files (Images/Videos) directly to Cloudinary
  const handleMultiMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsMediaUploading(true);
    setServerError(null);

    try {
      for (const file of files) {
        const isVideo = file.type.startsWith("video/");
        const resourceType = isVideo ? "video" : "image";

        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "realspace-events" }),
        });

        if (!signRes.ok) {
          const errJson = await signRes.json().catch(() => ({}));
          throw new Error(errJson.error || "Failed to get upload signature.");
        }

        const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        const targetCloud = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dipeupebc";

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadErr.error?.message || `Cloudinary ${resourceType} upload failed.`);
        }

        const uploadData = await uploadRes.json();

        appendMedia({
          mediaUrl: uploadData.secure_url || uploadData.url,
          mediaPublicId: uploadData.public_id,
          mediaType: isVideo ? "VIDEO" : "IMAGE",
          sortOrder: mediaFields.length,
        });
      }
    } catch (err: any) {
      console.error("Multi media upload error:", err);
      setServerError(err.message || "Failed to upload gallery media.");
    } finally {
      setIsMediaUploading(false);
      // reset file input
      e.target.value = "";
    }
  };

  const onSubmit = async (data: EventInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res =
        mode === "create"
          ? await createEvent(data)
          : await updateEvent(eventId!, data);

      if (res.success) {
        router.push("/admin/events");
        router.refresh();
      } else {
        setServerError(res.error || "Failed to save event.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setServerError("An unexpected error occurred while saving the event.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D6A66] hover:text-[#1C1C1C] transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events List
        </Link>
        <h1 className="text-2xl font-serif font-bold text-[#1C1C1C]">
          {mode === "create" ? "Add New Event" : "Edit Event"}
        </h1>
        <p className="text-sm text-[#6D6A66] mt-1">
          {mode === "create"
            ? "Create a new exhibition or event showcase entry with cover media and photo/video gallery."
            : "Update event details, cover image, and gallery media items."}
        </p>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white border border-[#E8E2DA] rounded-xl p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-semibold text-[#1C1C1C] flex items-center gap-2 border-b border-[#E8E2DA] pb-3">
            <Calendar className="w-5 h-5 text-[#C8A96A]" /> Event Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("title")}
                onChange={handleTitleChange}
                placeholder="e.g. Annual Design Expo 2026"
                className="w-full px-3.5 py-2.5 border border-[#E8E2DA] rounded-lg text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/50 focus:border-[#C8A96A] bg-white transition-all"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("slug")}
                placeholder="e.g. annual-design-expo-2026"
                className="w-full px-3.5 py-2.5 border border-[#E8E2DA] rounded-lg text-sm text-[#1C1C1C] font-mono focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/50 focus:border-[#C8A96A] bg-white transition-all"
              />
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                {...register("sortOrder", { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 border border-[#E8E2DA] rounded-lg text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/50 focus:border-[#C8A96A] bg-white transition-all"
              />
              <p className="text-xs text-[#6D6A66] mt-1">Lower numbers appear first.</p>
              {errors.sortOrder && (
                <p className="text-red-500 text-xs mt-1">{errors.sortOrder.message}</p>
              )}
            </div>

            {/* Is Published Checkbox */}
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("isPublished")}
                  className="w-5 h-5 rounded border-[#E8E2DA] text-[#C8A96A] focus:ring-[#C8A96A] accent-[#C8A96A] cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-[#1C1C1C]">Publish Immediately</span>
                  <p className="text-xs text-[#6D6A66]">Make this event visible on the public website.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Cover Image Upload */}
        <div className="bg-white border border-[#E8E2DA] rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-semibold text-[#1C1C1C] flex items-center gap-2 border-b border-[#E8E2DA] pb-3">
            <ImageIcon className="w-5 h-5 text-[#C8A96A]" /> Main Cover Image <span className="text-red-500">*</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Preview Box */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#F8F5F1] border-2 border-dashed border-[#E8E2DA] flex flex-col items-center justify-center text-[#6D6A66]">
              {coverImageUrl ? (
                <>
                  <Image
                    src={coverImageUrl}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setValue("coverImageUrl", "");
                      setValue("coverImagePublicId", "");
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                    title="Remove Cover Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <span className="text-xs font-medium">No cover image selected</span>
                </div>
              )}
            </div>

            {/* Upload Control */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-medium text-[#1C1C1C]">
                Upload Cover Photo
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1C] hover:bg-black text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                  {isCoverUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#C8A96A]" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isCoverUploading ? "Uploading Cover..." : "Select Cover File"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={isCoverUploading}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-[#6D6A66]">
                Recommended aspect ratio 16:9 or 4:3. Uploaded directly to Cloudinary.
              </p>

              <input type="hidden" {...register("coverImageUrl")} />
              <input type="hidden" {...register("coverImagePublicId")} />

              {errors.coverImageUrl && (
                <p className="text-red-500 text-xs">{errors.coverImageUrl.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Event Media Gallery (Multiple Images / Videos) */}
        <div className="bg-white border border-[#E8E2DA] rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8E2DA] pb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1C1C1C] flex items-center gap-2">
                <Film className="w-5 h-5 text-[#C8A96A]" /> Event Media Gallery
              </h2>
              <p className="text-xs sm:text-sm text-[#6D6A66] mt-0.5">
                Upload photos and videos taken during this event. Supports multi-file selection.
              </p>
            </div>

            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C8A96A] hover:bg-[#B78A47] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 w-full sm:w-auto">
              {isMediaUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isMediaUploading ? "Uploading Media..." : "Upload Media File(s)"}
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMultiMediaUpload}
                disabled={isMediaUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Media Items Grid */}
          {mediaFields.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-[#E8E2DA] rounded-xl bg-[#F8F5F1]/50 text-[#6D6A66]">
              <Film className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No media uploaded to this event gallery yet.</p>
              <p className="text-xs text-[#6D6A66] mt-1">
                Click &quot;Upload Media File(s)&quot; above to select images or videos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaFields.map((field, index) => {
                const mediaUrl = watch(`media.${index}.mediaUrl`);
                const mediaType = watch(`media.${index}.mediaType`);

                return (
                  <div
                    key={field.id}
                    className="group relative bg-white border border-[#E8E2DA] rounded-lg overflow-hidden shadow-xs hover:border-[#C8A96A] transition-all flex flex-col"
                  >
                    {/* Media Preview Box */}
                    <div className="relative w-full aspect-square bg-neutral-900 flex items-center justify-center overflow-hidden">
                      {mediaType === "VIDEO" ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/80 text-white p-2">
                          <Film className="w-8 h-8 text-[#C8A96A] mb-1" />
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black/60 rounded text-amber-300">
                            Video
                          </span>
                        </div>
                      ) : (
                        <Image
                          src={mediaUrl}
                          alt={`Media ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="200px"
                        />
                      )}

                      {/* Remove Button Overlay */}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md opacity-90 hover:opacity-100 cursor-pointer"
                        title="Remove Media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-2.5 bg-[#F8F5F1] text-xs flex items-center justify-between border-t border-[#E8E2DA]">
                      <span className="font-mono text-[11px] text-[#6D6A66]">
                        #{index + 1} ({mediaType})
                      </span>
                      <input
                        type="number"
                        min="0"
                        {...register(`media.${index}.sortOrder`, { valueAsNumber: true })}
                        placeholder="Order"
                        className="w-14 px-1.5 py-1 text-xs border border-[#E8E2DA] rounded bg-white font-mono text-center text-[#1C1C1C]"
                        title="Sort Order"
                      />
                    </div>

                    {/* Hidden inputs to pass data to react-hook-form */}
                    <input type="hidden" {...register(`media.${index}.mediaUrl`)} />
                    <input type="hidden" {...register(`media.${index}.mediaPublicId`)} />
                    <input type="hidden" {...register(`media.${index}.mediaType`)} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2DA]">
          <Link
            href="/admin/events"
            className="px-6 py-2.5 min-h-[44px] border border-[#E8E2DA] text-[#6D6A66] hover:bg-[#F8F5F1] text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isCoverUploading || isMediaUploading}
            className="inline-flex items-center justify-center gap-2 px-8 py-2.5 min-h-[44px] bg-[#C8A96A] text-white text-sm font-semibold rounded-lg hover:bg-[#B78A47] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Check className="w-4 h-4 text-white" />
            )}
            {isSubmitting
              ? "Saving Event..."
              : mode === "create"
              ? "Create Event"
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
