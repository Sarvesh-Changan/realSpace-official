"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Loader2,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { reraSettingsSchema, type ReraSettingsInput } from "../schema";
import { updateReraSettings } from "../actions";

export function ReraSettingsForm({
  initialData,
}: {
  initialData: ReraSettingsInput;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingFounder, setIsUploadingFounder] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReraSettingsInput>({
    resolver: zodResolver(reraSettingsSchema),
    defaultValues: initialData,
  });

  const reraRegistrationNo = watch("reraRegistrationNo");
  const heroImageUrl = watch("heroImageUrl");
  const founderImageUrl = watch("founderImageUrl");
  const areasServedRaw = watch("areasServedRaw") || "";

  // Parse areas into an array for tag display
  const areaTags = areasServedRaw
    ? areasServedRaw
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];
  const [newTagInput, setNewTagInput] = useState("");

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (areaTags.includes(trimmed)) {
      setNewTagInput("");
      return;
    }
    const updated = [...areaTags, trimmed].join(", ");
    setValue("areasServedRaw", updated, { shouldDirty: true });
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = areaTags
      .filter((tag) => tag.toLowerCase() !== tagToRemove.toLowerCase())
      .join(", ");
    setValue("areasServedRaw", updated, { shouldDirty: true });
  };

  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB limit

  const handleFileUpload = async (
    file: File,
    fieldUrl: "heroImageUrl" | "founderImageUrl",
    fieldPublicId: "heroImagePublicId" | "founderImagePublicId",
    setLoading: (val: boolean) => void
  ) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(
        `File "${file.name}" (${sizeMB}MB) exceeds the 100MB size limit.`
      );
      return;
    }

    setLoading(true);
    setUploadError(null);

    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "rera-general" }),
      });

      if (!signRes.ok) {
        const errJson = await signRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to get upload signature.");
      }

      const { signature, timestamp, folder, cloudName, apiKey } =
        await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "api_key",
        apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
      );
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const targetCloud =
        cloudName ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        "dipeupebc";

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${targetCloud}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json().catch(() => ({}));
        throw new Error(
          uploadErr.error?.message || "Cloudinary upload failed."
        );
      }

      const uploadData = await uploadRes.json();

      setValue(fieldUrl, uploadData.secure_url || uploadData.url, {
        shouldDirty: true,
      });
      setValue(fieldPublicId, uploadData.public_id, { shouldDirty: true });
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errMsg =
        err instanceof Error ? err.message : "Failed to upload image.";
      setUploadError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReraSettingsInput) => {
    setIsSubmitting(true);
    setMessage(null);
    setUploadError(null);

    const result = await updateReraSettings(data);

    if (result.success) {
      setMessage({ type: "success", text: "RERA settings saved successfully." });
    } else {
      setMessage({
        type: "error",
        text: result.error || "Something went wrong.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-4xl"
    >
      {/* RERA Registration Warning Banner */}
      {(!reraRegistrationNo || reraRegistrationNo.trim() === "") && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-amber-300 bg-amber-50 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">
              RERA registration number not set — it will not be shown on the
              public site.
            </p>
            <p className="text-amber-800 text-xs mt-0.5">
              To display the MahaRERA trust badge, header ribbon, footer
              registration line, and compliance certificate, enter a valid
              MahaRERA number below.
            </p>
          </div>
        </div>
      )}

      {/* Global feedback message */}
      {message && (
        <div
          className={`p-4 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Upload error display */}
      {uploadError && (
        <div className="p-4 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
          {uploadError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
        {/* Section: Business Details */}
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
            Business Details
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Broker / Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("brokerName")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.brokerName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.brokerName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Tagline
          </label>
          <input
            type="text"
            {...register("tagline")}
            placeholder="e.g. Real Estate & Advisory Services in Thane"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.tagline && (
            <p className="mt-1 text-xs text-red-500">{errors.tagline.message}</p>
          )}
        </div>

        {/* Section: MahaRERA Registration */}
        <div className="sm:col-span-2 mt-4">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
            MahaRERA Registration & Compliance
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            MahaRERA Registration No.
          </label>
          <input
            type="text"
            {...register("reraRegistrationNo")}
            placeholder="e.g. A51700000000"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.reraRegistrationNo && (
            <p className="mt-1 text-xs text-red-500">
              {errors.reraRegistrationNo.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            RERA Registered Entity Name
          </label>
          <input
            type="text"
            {...register("reraRegisteredName")}
            placeholder="Legal name registered under MahaRERA"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.reraRegisteredName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.reraRegisteredName.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            MahaRERA Verification URL
          </label>
          <input
            type="url"
            {...register("reraVerifyUrl")}
            placeholder="https://maharera.mahaonline.gov.in/..."
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.reraVerifyUrl && (
            <p className="mt-1 text-xs text-red-500">
              {errors.reraVerifyUrl.message}
            </p>
          )}
        </div>

        {/* Section: Contact Details */}
        <div className="sm:col-span-2 mt-4">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
            Contact Details
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Primary Phone
          </label>
          <input
            type="text"
            {...register("phone")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Alternate Phone
          </label>
          <input
            type="text"
            {...register("altPhone")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.altPhone && (
            <p className="mt-1 text-xs text-red-500">{errors.altPhone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            WhatsApp Number
          </label>
          <input
            type="text"
            {...register("whatsapp")}
            placeholder="+91..."
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.whatsapp && (
            <p className="mt-1 text-xs text-red-500">
              {errors.whatsapp.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Office Hours
          </label>
          <input
            type="text"
            {...register("officeHours")}
            placeholder="e.g. Mon – Sat: 10:00 AM – 7:30 PM"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.officeHours && (
            <p className="mt-1 text-xs text-red-500">
              {errors.officeHours.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            Head Office Address
          </label>
          <textarea
            {...register("address")}
            rows={3}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>

        {/* Section: Social Links */}
        <div className="sm:col-span-2 mt-4">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
            Social Links
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Instagram URL
          </label>
          <input
            type="url"
            {...register("instagram")}
            placeholder="https://instagram.com/..."
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.instagram && (
            <p className="mt-1 text-xs text-red-500">
              {errors.instagram.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Facebook URL
          </label>
          <input
            type="url"
            {...register("facebook")}
            placeholder="https://facebook.com/..."
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.facebook && (
            <p className="mt-1 text-xs text-red-500">
              {errors.facebook.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            YouTube URL
          </label>
          <input
            type="url"
            {...register("youtube")}
            placeholder="https://youtube.com/..."
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.youtube && (
            <p className="mt-1 text-xs text-red-500">{errors.youtube.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            LinkedIn URL
          </label>
          <input
            type="url"
            {...register("linkedin")}
            placeholder="https://linkedin.com/in/..."
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.linkedin && (
            <p className="mt-1 text-xs text-red-500">
              {errors.linkedin.message}
            </p>
          )}
        </div>

        {/* Section: Hero Section */}
        <div className="sm:col-span-2 mt-4">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
            Hero Section
          </h2>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            Hero Headline
          </label>
          <input
            type="text"
            {...register("heroHeadline")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.heroHeadline && (
            <p className="mt-1 text-xs text-red-500">
              {errors.heroHeadline.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            Hero Subhead
          </label>
          <textarea
            {...register("heroSubhead")}
            rows={2}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.heroSubhead && (
            <p className="mt-1 text-xs text-red-500">
              {errors.heroSubhead.message}
            </p>
          )}
        </div>

        {/* Hero Image Upload */}
        <div className="sm:col-span-2 space-y-3">
          <label className="block text-sm font-medium text-neutral-700">
            Hero Background Image
          </label>
          <p className="text-xs text-neutral-500">
            Recommended: high-resolution landscape photo (1920×1080), max 100MB.
          </p>

          {heroImageUrl ? (
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-48 h-28 rounded-md overflow-hidden border border-neutral-200 shrink-0 bg-neutral-900">
                <Image
                  src={heroImageUrl}
                  alt="Hero Image Preview"
                  fill
                  sizes="192px"
                  className="object-cover"
                  unoptimized={!heroImageUrl.includes("res.cloudinary.com")}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue("heroImageUrl", "", { shouldDirty: true });
                  setValue("heroImagePublicId", "", { shouldDirty: true });
                }}
                disabled={isUploadingHero || isSubmitting}
                className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] bg-white border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Remove Image
              </button>
            </div>
          ) : (
            <div>
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50">
                {isUploadingHero ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploadingHero ? "Uploading Hero Image..." : "Upload Hero Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "heroImageUrl",
                        "heroImagePublicId",
                        setIsUploadingHero
                      );
                    }
                    e.target.value = "";
                  }}
                  disabled={isUploadingHero || isSubmitting}
                  className="sr-only"
                />
              </label>
            </div>
          )}
          <input type="hidden" {...register("heroImageUrl")} />
          <input type="hidden" {...register("heroImagePublicId")} />
        </div>

        {/* Section: Welcome Section */}
        <div className="sm:col-span-2 mt-4">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
            Welcome Section
          </h2>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            Welcome Title
          </label>
          <input
            type="text"
            {...register("welcomeTitle")}
            placeholder="e.g. Welcome to REALSPACE Realty"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.welcomeTitle && (
            <p className="mt-1 text-xs text-red-500">
              {errors.welcomeTitle.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            Welcome Body
          </label>
          <textarea
            {...register("welcomeBody")}
            rows={4}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.welcomeBody && (
            <p className="mt-1 text-xs text-red-500">
              {errors.welcomeBody.message}
            </p>
          )}
        </div>

        {/* Section: About & Founder */}
        <div className="sm:col-span-2 mt-4">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
            About & Founder Details
          </h2>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            About Title
          </label>
          <input
            type="text"
            {...register("aboutTitle")}
            placeholder="e.g. Trusted Property Experts in Thane"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.aboutTitle && (
            <p className="mt-1 text-xs text-red-500">
              {errors.aboutTitle.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            About Body (Paragraphs separated by blank lines)
          </label>
          <textarea
            {...register("aboutBody")}
            rows={5}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.aboutBody && (
            <p className="mt-1 text-xs text-red-500">
              {errors.aboutBody.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Founder Name
          </label>
          <input
            type="text"
            {...register("founderName")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.founderName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.founderName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Founder Role / Title
          </label>
          <input
            type="text"
            {...register("founderRole")}
            placeholder="e.g. Founder & Managing Director"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.founderRole && (
            <p className="mt-1 text-xs text-red-500">
              {errors.founderRole.message}
            </p>
          )}
        </div>

        {/* Founder Image Upload */}
        <div className="sm:col-span-2 space-y-3">
          <label className="block text-sm font-medium text-neutral-700">
            Founder Photo
          </label>
          <p className="text-xs text-neutral-500">
            Recommended: portrait orientation (3:4 or square), max 100MB.
          </p>

          {founderImageUrl ? (
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-32 h-40 rounded-md overflow-hidden border border-neutral-200 shrink-0 bg-neutral-900">
                <Image
                  src={founderImageUrl}
                  alt="Founder Photo Preview"
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized={!founderImageUrl.includes("res.cloudinary.com")}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue("founderImageUrl", "", { shouldDirty: true });
                  setValue("founderImagePublicId", "", { shouldDirty: true });
                }}
                disabled={isUploadingFounder || isSubmitting}
                className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] bg-white border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Remove Photo
              </button>
            </div>
          ) : (
            <div>
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50">
                {isUploadingFounder ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploadingFounder
                  ? "Uploading Founder Photo..."
                  : "Upload Founder Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "founderImageUrl",
                        "founderImagePublicId",
                        setIsUploadingFounder
                      );
                    }
                    e.target.value = "";
                  }}
                  disabled={isUploadingFounder || isSubmitting}
                  className="sr-only"
                />
              </label>
            </div>
          )}
          <input type="hidden" {...register("founderImageUrl")} />
          <input type="hidden" {...register("founderImagePublicId")} />
        </div>

        {/* Section: Key Statistics */}
        <div className="sm:col-span-2 mt-4">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
            Key Statistics
          </h2>
          <p className="text-xs text-neutral-500 mb-4">
            Stats render on the home and about pages only when set with a value.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Years of Experience
          </label>
          <input
            type="number"
            min={0}
            step={1}
            {...register("yearsExperience", { valueAsNumber: true })}
            placeholder="e.g. 15"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.yearsExperience && (
            <p className="mt-1 text-xs text-red-500">
              {errors.yearsExperience.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Happy Families Served
          </label>
          <input
            type="number"
            min={0}
            step={1}
            {...register("happyFamilies", { valueAsNumber: true })}
            placeholder="e.g. 500"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.happyFamilies && (
            <p className="mt-1 text-xs text-red-500">
              {errors.happyFamilies.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Properties Closed / Deals
          </label>
          <input
            type="number"
            min={0}
            step={1}
            {...register("propertiesClosed", { valueAsNumber: true })}
            placeholder="e.g. 750"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {errors.propertiesClosed && (
            <p className="mt-1 text-xs text-red-500">
              {errors.propertiesClosed.message}
            </p>
          )}
        </div>

        {/* Section: Areas Served (Tag Input) */}
        <div className="sm:col-span-2 mt-4 space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
            Areas Served
          </h2>
          <p className="text-xs text-neutral-500">
            Add neighbourhoods, localities or regions served (e.g., Ghodbunder Road, Majiwada, Vartak Nagar).
          </p>

          {/* Active Tags */}
          <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-neutral-50 rounded-md border border-neutral-200">
            {areaTags.length > 0 ? (
              areaTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-300 rounded-full text-xs font-medium text-neutral-800 shadow-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-neutral-400 hover:text-red-500 cursor-pointer transition-colors"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-neutral-400 self-center">
                No areas added yet. Type below to add.
              </span>
            )}
          </div>

          {/* Add Tag Field */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Type area name and click Add"
              className="flex-1 rounded-md border border-neutral-300 px-3.5 py-2 min-h-[40px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Area
            </button>
          </div>
          <input type="hidden" {...register("areasServedRaw")} />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-neutral-200 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isUploadingHero || isUploadingFounder}
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Saving RERA Settings..." : "Save RERA Settings"}
        </button>
      </div>
    </form>
  );
}

