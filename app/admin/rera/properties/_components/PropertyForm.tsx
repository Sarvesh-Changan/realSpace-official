"use client";

import { useRef, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  Play,
  ArrowUp,
  ArrowDown,
  Check,
  AlertTriangle,
  X,
  Star,
  Film,
} from "lucide-react";
import {
  reraPropertySchema,
  type ReraPropertyInput,
} from "../schema";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";

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
}: {
  initialData?: ReraPropertyInput;
  onSubmitAction: (
    data: ReraPropertyInput
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const [amenityInput, setAmenityInput] = useState("");
  const [userEditedSlug, setUserEditedSlug] = useState(Boolean(initialData?.slug));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReraPropertyInput>({
    resolver: zodResolver(reraPropertySchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      listingType: "SALE",
      propertyType: "APARTMENT",
      bhkLabel: "",
      priceLabel: "",
      priceAmount: null,
      carpetAreaSqFt: null,
      builtUpAreaSqFt: null,
      furnishing: "",
      locality: "",
      city: "Thane",
      projectName: "",
      builderName: "",
      projectReraNo: "",
      possession: "",
      description: "",
      coverImageUrl: "",
      coverImagePublicId: "",
      isFeatured: false,
      isNewLaunch: false,
      isPublished: true,
      sortOrder: 0,
      amenities: [],
      specifications: [
        { label: "Structure", value: "" },
        { label: "Flooring", value: "" },
      ],
      images: [],
    },
  });

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
    move: moveGallery,
  } = useFieldArray({
    control,
    name: "images",
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: "specifications",
  });

  const watchedImages = useWatch({ name: "images", control }) || [];
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

  // Multi-file Gallery Upload (images and videos)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 1. Pre-upload size check for all files before any upload starts
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setServerError(`File "${file.name}" (${sizeMB}MB) exceeds the 100MB limit.`);
        e.target.value = "";
        return;
      }
    }

    setIsUploadingGallery(true);
    setServerError(null);
    setBatchProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBatchProgress({ current: i + 1, total: files.length });

        const isVideo =
          file.type.startsWith("video/") ||
          Boolean(file.name.match(/\.(mp4|mov|webm|ogv|m4v)$/i));

        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: "rera-properties",
            resourceType: isVideo ? "video" : "image",
          }),
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
        const resourceType = isVideo ? "video" : "auto";

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadErr.error?.message || `Upload failed for ${file.name}`);
        }

        const uploadData = await uploadRes.json();
        const isVideoResult =
          isVideo ||
          uploadData.resource_type === "video" ||
          (uploadData.secure_url && uploadData.secure_url.includes("/video/upload/"));

        const defaultAlt = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ");

        appendGallery({
          url: uploadData.secure_url || uploadData.url,
          publicId: uploadData.public_id,
          mediaType: isVideoResult ? "VIDEO" : "IMAGE",
          altText: isVideoResult ? "" : defaultAlt,
          sortOrder: galleryFields.length + i,
        });
      }
    } catch (err: unknown) {
      console.error("Gallery upload error:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload gallery files.";
      setServerError(msg);
    } finally {
      setIsUploadingGallery(false);
      setBatchProgress(null);
      e.target.value = "";
    }
  };

  const onSubmit = async (data: ReraPropertyInput) => {
    // Validate required alt text for images
    for (let i = 0; i < data.images.length; i++) {
      const img = data.images[i];
      if (img.mediaType === "IMAGE" && (!img.altText || img.altText.trim() === "")) {
        setServerError(`Image #${i + 1} is missing required alt text for accessibility.`);
        return;
      }
    }

    setIsSubmitting(true);
    setServerError(null);

    const sanitizedData: ReraPropertyInput = {
      ...data,
      priceAmount: data.priceAmount && !isNaN(data.priceAmount) ? data.priceAmount : null,
      carpetAreaSqFt: data.carpetAreaSqFt && !isNaN(data.carpetAreaSqFt) ? data.carpetAreaSqFt : null,
      builtUpAreaSqFt: data.builtUpAreaSqFt && !isNaN(data.builtUpAreaSqFt) ? data.builtUpAreaSqFt : null,
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

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("propertyType")}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 bg-white"
            >
              <option value="APARTMENT">Apartment / Flat</option>
              <option value="VILLA">Villa / Row House</option>
              <option value="COMMERCIAL">Commercial Office / Shop</option>
              <option value="PLOT">Plot / Land</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.propertyType && (
              <p className="mt-1 text-xs text-red-500">{errors.propertyType.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          Pricing
        </h2>

        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Price Display Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("priceLabel")}
              placeholder="e.g. ₹85 Lakh, ₹1.2 Cr, ₹35,000 / month"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            {errors.priceLabel && (
              <p className="mt-1 text-xs text-red-500">{errors.priceLabel.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Price Amount in Rupees <span className="text-neutral-400 font-normal">(positive integer)</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              {...register("priceAmount", { valueAsNumber: true })}
              placeholder="e.g. 8500000"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Required for sorting and budget filter brackets. Properties without price amount sort last.
            </p>
            {errors.priceAmount && (
              <p className="mt-1 text-xs text-red-500">{errors.priceAmount.message}</p>
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

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Possession Status / Timeline
            </label>
            <input
              type="text"
              {...register("possession")}
              placeholder="e.g. Ready to Move, Dec 2026"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
        </div>
      </div>

      {/* Area & Specifications */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          Area & Furnishing
        </h2>

        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Carpet Area (Sq. Ft.)
            </label>
            <input
              type="number"
              min={0}
              {...register("carpetAreaSqFt", { valueAsNumber: true })}
              placeholder="e.g. 650"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Built-up / Super Area (Sq. Ft.)
            </label>
            <input
              type="number"
              min={0}
              {...register("builtUpAreaSqFt", { valueAsNumber: true })}
              placeholder="e.g. 920"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Furnishing State
            </label>
            <input
              type="text"
              {...register("furnishing")}
              placeholder="e.g. Unfurnished, Semi-furnished"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">
          Property Description
        </label>
        <textarea
          rows={5}
          {...register("description")}
          placeholder="Provide a detailed overview of the property, highlights, neighborhood advantages, and connectivity..."
          className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
        )}
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

      {/* Specifications (Repeatable Label/Value list) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            Specifications
          </h2>
          <button
            type="button"
            onClick={() => appendSpec({ label: "", value: "" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Specification
          </button>
        </div>

        {specFields.map((field, idx) => (
          <div key={field.id} className="flex items-center gap-3">
            <input
              type="text"
              {...register(`specifications.${idx}.label`)}
              placeholder="e.g. Flooring / Kitchen / Doors"
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            <input
              type="text"
              {...register(`specifications.${idx}.value`)}
              placeholder="e.g. Vitrified tiles in all rooms"
              className="flex-2 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            <button
              type="button"
              onClick={() => removeSpec(idx)}
              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              title="Remove specification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Cover Image Upload Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          Cover Image
        </h2>
        <p className="text-xs text-neutral-500">
          The main image displayed on cards and hero previews. You can also pick any gallery image below and click &quot;Set as cover&quot;.
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

      {/* Gallery Section (Multi-file Images & Videos) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-200 pb-2">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Property Gallery (Images & Videos)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Multi-file upload (max 100MB per file). Videos are displayed with an auto-generated poster frame.
            </p>
          </div>

          <button
            type="button"
            onClick={() => galleryFileInputRef.current?.click()}
            disabled={isUploadingGallery || isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors shadow-xs shrink-0 disabled:opacity-50"
          >
            {isUploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isUploadingGallery ? "Uploading..." : "Add Images & Videos"}
          </button>
          <input
            ref={galleryFileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleGalleryUpload}
            disabled={isUploadingGallery || isSubmitting}
            className="sr-only"
            aria-label="Choose gallery images and videos"
          />
        </div>

        {/* Batch Upload Progress Indicator */}
        {batchProgress && (
          <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 text-xs flex items-center justify-between">
            <span className="font-medium text-neutral-700">
              Uploading file {batchProgress.current} of {batchProgress.total}...
            </span>
            <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
          </div>
        )}

        {/* Gallery Items Grid */}
        {galleryFields.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-lg text-neutral-400 text-sm">
            No media files uploaded yet. Click &quot;Add Images & Videos&quot; to upload photos and walkthrough videos.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {galleryFields.map((field, idx) => {
              const item = watchedImages[idx] || field;
              const isVideo = item.mediaType === "VIDEO";
              const isCover = watchedCoverUrl === item.url;
              const thumbUrl = isVideo ? getVideoThumbnailUrl(item.url, "VIDEO") : item.url;

              return (
                <div
                  key={field.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isCover
                      ? "border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50/50"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Media Thumbnail */}
                    <div className="relative w-28 h-24 rounded bg-neutral-900 overflow-hidden border border-neutral-200 shrink-0">
                      {isVideo ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {thumbUrl && !thumbUrl.match(/\.(mp4|mov|webm|ogv|m4v)/i) ? (
                            <Image
                              src={thumbUrl}
                              alt={item.altText || "Video thumbnail"}
                              fill
                              sizes="112px"
                              className="object-cover opacity-80"
                              unoptimized={!thumbUrl.includes("res.cloudinary.com")}
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center shadow">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.altText || "Property image"}
                          fill
                          sizes="112px"
                          className="object-cover"
                          unoptimized={!item.url.includes("res.cloudinary.com")}
                        />
                      )}

                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-black/70 text-white">
                        {isVideo ? (
                          <span className="flex items-center gap-0.5">
                            <Film className="w-2.5 h-2.5" /> Video
                          </span>
                        ) : (
                          "Image"
                        )}
                      </span>
                    </div>

                    {/* Metadata & Controls */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Alt Text {isVideo ? "(Optional)" : <span className="text-red-500">*</span>}
                          </label>
                          {isCover && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-900 uppercase">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Cover
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          {...register(`images.${idx}.altText`)}
                          placeholder={isVideo ? "Video caption" : "Describe image for accessibility"}
                          className="mt-1 block w-full rounded border border-neutral-300 px-2 py-1 text-xs focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        />
                        {errors.images?.[idx]?.altText && (
                          <p className="mt-0.5 text-[10px] text-red-500">
                            {errors.images[idx]?.altText?.message}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => idx > 0 && moveGallery(idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => idx < galleryFields.length - 1 && moveGallery(idx, idx + 1)}
                            disabled={idx === galleryFields.length - 1}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          {!isVideo && !isCover && (
                            <button
                              type="button"
                              onClick={() => {
                                setValue("coverImageUrl", item.url, { shouldDirty: true });
                                setValue("coverImagePublicId", item.publicId || "", { shouldDirty: true });
                              }}
                              className="px-2 py-0.5 text-[11px] font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors cursor-pointer ml-1"
                            >
                              Set as cover
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isCover) {
                              setValue("coverImageUrl", "", { shouldDirty: true });
                              setValue("coverImagePublicId", "", { shouldDirty: true });
                            }
                            removeGallery(idx);
                          }}
                          className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Remove media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
          disabled={isSubmitting || isUploadingCover || isUploadingGallery}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving Property..." : "Save Property Listing"}
        </button>
      </div>
    </form>
  );
}

