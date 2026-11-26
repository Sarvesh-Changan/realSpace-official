"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  reraPropertySchema,
  type ReraPropertyInput,
} from "../schema";
import { PageSectionsPanel, type PageSectionRow } from "./PageSectionsPanel";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function PropertyForm({
  initialData,
  onSubmitAction,
  categories,
  initialSections,
}: {
  initialData?: ReraPropertyInput;
  initialSections?: PageSectionRow[];
  categories: Array<{ id: string; name: string; isPublished: boolean }>;
  onSubmitAction: (
    data: ReraPropertyInput
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [amenityInput, setAmenityInput] = useState("");
  const [userEditedSlug, setUserEditedSlug] = useState(Boolean(initialData?.slug));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReraPropertyInput>({
    resolver: zodResolver(reraPropertySchema),
    defaultValues: initialData || {
      title: "",
      tagline: "",
      slug: "",
      categoryId: categories.find((category) => category.name === "Apartment")?.id ?? "",
      listingType: "SALE",
      bhkLabel: "",
      locality: "",
      city: "Thane",
      projectName: "",
      builderName: "",
      projectReraNo: "",
      description: "",
      coverImageUrl: "",
      coverImagePublicId: "",
      isFeatured: false,
      isNewLaunch: false,
      isPublished: true,
      sortOrder: 0,
      amenities: [],
      images: [],
    },
  });

  const watchedCoverUrl = watch("coverImageUrl");
  const watchedAmenities = watch("amenities") || [];

  // Auto-generate slug from title unless manually edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    if (!userEditedSlug) {
      setValue("slug", slugify(titleVal), { shouldValidate: true });
    }
  };

  // Amenities tags management
  const handleAddAmenity = () => {
    const trimmed = amenityInput.trim();
    if (trimmed && !watchedAmenities.includes(trimmed)) {
      setValue("amenities", [...watchedAmenities, trimmed], {
        shouldDirty: true,
        shouldValidate: true,
      });
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (tag: string) => {
    setValue(
      "amenities",
      watchedAmenities.filter((a) => a !== tag),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  // Single Cover Image Upload handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setServerError(`Cover image "${file.name}" (${sizeMB}MB) exceeds the 100MB limit.`);
      e.target.value = "";
      return;
    }

    setIsUploadingCover(true);
    setServerError(null);

    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "rera-properties", resourceType: "image" }),
      });

      if (!signRes.ok) {
        const errJson = await signRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to get upload signature.");
      }

      const signData = await signRes.json();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder || "rera-properties");

      const targetCloud = signData.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dipeupebc";
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${targetCloud}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json().catch(() => ({}));
        throw new Error(uploadErr.error?.message || "Cover image upload failed.");
      }

      const uploadData = await uploadRes.json();
      setValue("coverImageUrl", uploadData.secure_url || uploadData.url, { shouldDirty: true });
      setValue("coverImagePublicId", uploadData.public_id, { shouldDirty: true });
    } catch (err: unknown) {
      console.error("Cover upload error:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload cover image.";
      setServerError(msg);
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (data: ReraPropertyInput) => {
    setIsSubmitting(true);
    setServerError(null);

    const sanitizedData: ReraPropertyInput = {
      ...data,
      sortOrder: data.sortOrder && !isNaN(data.sortOrder) ? data.sortOrder : 0,
    };

    const result = await onSubmitAction(sanitizedData);

    if (result.success) {
      router.push("/admin/rera/properties");
      router.refresh();
    } else {
      setServerError(result.error || "Failed to save property. Please review inputs.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-5xl"
    >
      {/* Server Error Alert */}
      {serverError && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-red-300 bg-red-50 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{serverError}</div>
        </div>
      )}

      {/* Basic Property Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          Basic Details
        </h2>

        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-neutral-700">
              Property Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title", {
                onChange: handleTitleChange,
              })}
              placeholder="e.g. Luxurious 2 BHK in Majiwada with Deck"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              URL Slug <span className="text-neutral-400 font-normal">(auto-generated)</span>
            </label>
            <input
              type="text"
              {...register("slug", {
                onChange: () => setUserEditedSlug(true),
              })}
              placeholder="e.g. luxurious-2-bhk-majiwada"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm font-mono focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              BHK / Configuration Label
            </label>
            <input
              type="text"
              {...register("bhkLabel")}
              placeholder="e.g. 2 BHK, 3 BHK, 4 BHK Penthouse"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            {errors.bhkLabel && (
              <p className="mt-1 text-xs text-red-500">{errors.bhkLabel.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select required {...register("categoryId")} className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500">
              <option value="">Select a category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.isPublished ? "" : " (unpublished)"}</option>)}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">Tagline <span className="text-neutral-400 font-normal">(optional, up to 160 characters)</span></label>
            <input type="text" maxLength={160} {...register("tagline")} placeholder="e.g. Spacious 2 & 3 BHK homes" className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
            {errors.tagline && <p className="mt-1 text-xs text-red-500">{errors.tagline.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Listing Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("listingType")}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 bg-white"
            >
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
            </select>
            {errors.listingType && (
              <p className="mt-1 text-xs text-red-500">{errors.listingType.message}</p>
            )}
          </div>

        </div>

      </div>

      {/* Project & Location Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          Location & Developer Details
        </h2>

        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Locality <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("locality")}
              placeholder="e.g. Majiwada, Ghodbunder Road"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            {errors.locality && (
              <p className="mt-1 text-xs text-red-500">{errors.locality.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              City
            </label>
            <input
              type="text"
              {...register("city")}
              placeholder="Thane"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Project Name
            </label>
            <input
              type="text"
              {...register("projectName")}
              placeholder="e.g. Rustomjee Urbania"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Builder / Developer Name
            </label>
            <input
              type="text"
              {...register("builderName")}
              placeholder="e.g. Rustomjee Group"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Project MahaRERA Number
            </label>
            <input
              type="text"
              {...register("projectReraNo")}
              placeholder="e.g. P51700000000"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Shown on property card. Published listings without RERA show a warning.
            </p>
          </div>

        </div>
      </div>

      {/* Amenities (Tag Input) */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          Amenities
        </h2>
        <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-neutral-50 rounded-md border border-neutral-200">
          {watchedAmenities.length > 0 ? (
            watchedAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-300 rounded-full text-xs font-medium text-neutral-800 shadow-xs"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(amenity)}
                  className="text-neutral-400 hover:text-red-500 cursor-pointer"
                  aria-label={`Remove ${amenity}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-neutral-400 self-center">
              No amenities added yet. Type below to add (e.g. Swimming Pool, Gym, Clubhouse, 24/7 Security).
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddAmenity();
              }
            }}
            placeholder="Type amenity and press Enter"
            className="flex-1 rounded-md border border-neutral-300 px-3.5 py-2 min-h-[40px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          <button
            type="button"
            onClick={handleAddAmenity}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Amenity
          </button>
        </div>
      </div>

      {/* Cover Image Upload Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          Cover Image
        </h2>
        <p className="text-xs text-neutral-500">
          The single property image shown on the listing and beside the overview card.
        </p>

        {watchedCoverUrl ? (
          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-48 h-32 rounded-md overflow-hidden border border-neutral-200 shrink-0 bg-neutral-900">
              <Image
                src={watchedCoverUrl}
                alt="Cover Preview"
                fill
                sizes="192px"
                className="object-cover"
                unoptimized={!watchedCoverUrl.includes("res.cloudinary.com")}
              />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                <Check className="w-3.5 h-3.5" /> Current Cover Image
              </span>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setValue("coverImageUrl", "", { shouldDirty: true });
                    setValue("coverImagePublicId", "", { shouldDirty: true });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded hover:bg-red-50 transition-colors shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Cover
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => coverFileInputRef.current?.click()}
              disabled={isUploadingCover || isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50"
            >
              {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploadingCover ? "Uploading Cover..." : "Upload Cover Image"}
            </button>
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={isUploadingCover || isSubmitting}
              className="sr-only"
              aria-label="Choose cover image"
            />
          </div>
        )}
        <input type="hidden" {...register("coverImageUrl")} />
        <input type="hidden" {...register("coverImagePublicId")} />
      </div>

      <section className="space-y-3 rounded-lg border border-neutral-200 p-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Cover Image Overview Card</h2>
          <p className="mt-1 text-xs text-neutral-500">
            This text appears in a card beside the cover image. Its heading is generated from the property title.
          </p>
        </div>
        <textarea
          rows={5}
          {...register("description")}
          placeholder="Describe the project, its key features, neighborhood advantages, and connectivity..."
          className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
        )}
      </section>

      <PageSectionsPanel propertyId={initialData?.id} initialSections={initialSections} />

      {/* Visibility, Featured, and Sort Order */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          Listing Status & Display
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-neutral-800">
            <input
              type="checkbox"
              {...register("isPublished")}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer h-4 w-4"
            />
            <span>Published</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-neutral-800">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer h-4 w-4"
            />
            <span>Featured (Home Page)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-neutral-800">
            <input
              type="checkbox"
              {...register("isNewLaunch")}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer h-4 w-4"
            />
            <span>New Launch Project</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-neutral-600">
              Sort Order (0 = highest)
            </label>
            <input
              type="number"
              {...register("sortOrder", { valueAsNumber: true })}
              className="mt-1 block w-full rounded border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
        </div>
      </div>

      {/* Submission Buttons */}
      <div className="pt-6 border-t border-neutral-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/rera/properties")}
          className="px-5 py-2.5 min-h-[44px] bg-white border border-neutral-300 text-neutral-700 font-medium text-sm rounded-md hover:bg-neutral-50 transition-colors shadow-xs cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isUploadingCover}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving Property..." : "Save Property Listing"}
        </button>
      </div>
    </form>
  );
}

