"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { certificationSchema, type CertificationInput } from "../schema";
import { createCertification, updateCertification } from "../actions";

interface CertificationFormProps {
  mode: "create" | "update";
  certId?: string;
  initialData?: Partial<CertificationInput>;
}

export function CertificationForm({ mode, certId, initialData }: CertificationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CertificationInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(certificationSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      issuingBody: initialData?.issuingBody || "",
      certificateType: initialData?.certificateType || "COURSE",
      issueDate: initialData?.issueDate || "",
      validUntil: initialData?.validUntil || "",
      badgeLabel: initialData?.badgeLabel || "",
      imageUrl: initialData?.imageUrl || "",
      imagePublicId: initialData?.imagePublicId || "",
      certificateUrl: initialData?.certificateUrl || "",
      showCertificateButton: initialData?.showCertificateButton ?? false,
      isPublished: initialData?.isPublished ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  const currentImageUrl = watch("imageUrl");

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setServerError(null);

    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "realspace-certifications" }),
      });

      if (!signRes.ok) {
        const errJson = await signRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to get upload signature from server.");
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
        throw new Error(uploadErr.error?.message || "Cloudinary file upload failed.");
      }

      const uploadData = await uploadRes.json();

      setValue("imageUrl", uploadData.secure_url || uploadData.url);
      setValue("imagePublicId", uploadData.public_id);
    } catch (err: any) {
      console.error("Direct upload error:", err);
      setServerError(err.message || "Failed to upload image to Cloudinary.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setValue("imageUrl", "");
    setValue("imagePublicId", "");
  };

  const onSubmit = async (data: CertificationInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result =
        mode === "create"
          ? await createCertification(data)
          : await updateCertification(certId!, data);

      if (result.success) {
        router.push("/admin/certifications");
        router.refresh();
      } else {
        setServerError(result.error || "An error occurred while saving.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {serverError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
          {serverError}
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
              placeholder="e.g. Advanced Kitchen Ergonomics"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Issuing Body */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Issuing Body <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("issuingBody")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
              placeholder="e.g. Institute of Interior Design"
            />
            {errors.issuingBody && <p className="mt-1 text-xs text-red-500">{errors.issuingBody.message}</p>}
          </div>

          {/* Certificate Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Certificate Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("certificateType")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
            >
              <option value="COURSE">Course</option>
              <option value="MEMBERSHIP">Membership</option>
              <option value="REGISTRATION">Registration</option>
            </select>
            {errors.certificateType && <p className="mt-1 text-xs text-red-500">{errors.certificateType.message}</p>}
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Issue Date (Optional)
            </label>
            <input
              type="date"
              {...register("issueDate")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
            />
            {errors.issueDate && <p className="mt-1 text-xs text-red-500">{errors.issueDate.message}</p>}
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Valid Until (Optional)
            </label>
            <input
              type="date"
              {...register("validUntil")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
            />
            {errors.validUntil && <p className="mt-1 text-xs text-red-500">{errors.validUntil.message}</p>}
          </div>

          {/* Badge Label */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Badge Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("badgeLabel")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
              placeholder="e.g. Certified Professional"
            />
            {errors.badgeLabel && <p className="mt-1 text-xs text-red-500">{errors.badgeLabel.message}</p>}
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              {...register("sortOrder", { valueAsNumber: true })}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 font-mono"
            />
            {errors.sortOrder && <p className="mt-1 text-xs text-red-500">{errors.sortOrder.message}</p>}
          </div>

          {/* Cloudinary Upload Section */}
          <div className="md:col-span-2 space-y-3">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Certification Logo / Badge Image (Optional)
            </label>

            {currentImageUrl ? (
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-24 h-24 rounded-md overflow-hidden border border-neutral-200 shrink-0 bg-white p-2">
                  <Image
                    src={currentImageUrl}
                    alt="Certification Preview"
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                    unoptimized={!currentImageUrl.includes("res.cloudinary.com")}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <CldUploadWidget
                    signatureEndpoint="/api/cloudinary/sign"
                    options={{
                      sources: ["local", "url"],
                      folder: "realspace-certifications",
                      clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "avif"],
                    }}
                    onSuccess={(result: any) => {
                      if (result?.info) {
                        const secureUrl = result.info.secure_url || result.info.url;
                        const publicId = result.info.public_id;
                        setValue("imageUrl", secureUrl);
                        setValue("imagePublicId", publicId);
                      }
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        disabled={isUploading || isSubmitting}
                        className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-md hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" /> Change Image
                      </button>
                    )}
                  </CldUploadWidget>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploading || isSubmitting}
                    className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] bg-white border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? "Uploading Image..." : "Upload File"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDirectFileUpload}
                    disabled={isUploading || isSubmitting}
                    className="sr-only"
                  />
                </label>

                <CldUploadWidget
                  signatureEndpoint="/api/cloudinary/sign"
                  options={{
                    sources: ["local", "url"],
                    folder: "realspace-certifications",
                    clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "avif"],
                  }}
                  onSuccess={(result: any) => {
                    if (result?.info) {
                      const secureUrl = result.info.secure_url || result.info.url;
                      const publicId = result.info.public_id;
                      setValue("imageUrl", secureUrl);
                      setValue("imagePublicId", publicId);
                    }
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      disabled={isUploading || isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-white text-neutral-700 text-sm font-medium rounded-md border border-neutral-300 hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" /> Cloudinary Widget
                    </button>
                  )}
                </CldUploadWidget>
              </div>
            )}

            <input type="hidden" {...register("imageUrl")} />
            <input type="hidden" {...register("imagePublicId")} />
            {errors.imageUrl && <p className="mt-1 text-xs text-red-500">{errors.imageUrl.message}</p>}
          </div>

          {/* Certificate Drive Link */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Certificate Drive Link (Optional)
            </label>
            <input
              type="text"
              {...register("certificateUrl")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
              placeholder="https://drive.google.com/file/d/... or document URL"
            />
            {errors.certificateUrl && <p className="mt-1 text-xs text-red-500">{errors.certificateUrl.message}</p>}
            <p className="mt-1 text-xs text-neutral-500">
              Provide an external Google Drive or PDF document link for safe public viewing.
            </p>
          </div>

          {/* Show Certificate Button Toggle */}
          <div className="md:col-span-2 flex items-center pt-2 min-h-[44px]">
            <input
              type="checkbox"
              id="showCertificateButton"
              {...register("showCertificateButton")}
              className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
            />
            <label htmlFor="showCertificateButton" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
              Show &quot;View Certificate&quot; Button on Website
            </label>
          </div>

          {/* Is Published */}
          <div className="md:col-span-2 flex items-center pt-2 min-h-[44px]">
            <input
              type="checkbox"
              id="isPublished"
              {...register("isPublished")}
              className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
            />
            <label htmlFor="isPublished" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
              Publish this certification publicly
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/certifications")}
          disabled={isSubmitting || isUploading}
          className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-white text-neutral-700 text-sm font-medium rounded-md border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-brand-red text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> Uploading Image...
            </>
          ) : isSubmitting ? (
            "Saving..."
          ) : mode === "create" ? (
            "Create Certification"
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
