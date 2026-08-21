"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, Film, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { imageSchema, type ImageInput } from "../schema";
import { createImage, updateImage } from "../actions";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";

interface ImageFormProps {
    initialData?: ImageInput;
    categories: { id: string; name: string }[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function ImageForm({ initialData, categories, onSuccess, onCancel }: ImageFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const isUpdate = !!initialData?.id;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ImageInput>({
        resolver: zodResolver(imageSchema),
        defaultValues: {
            categoryId: initialData?.categoryId || "",
            title: initialData?.title || "",
            designType: initialData?.designType || "INTERIOR",
            mediaType: initialData?.mediaType || "IMAGE",
            url: initialData?.url || "",
            cloudinaryId: initialData?.cloudinaryId || "",
            theme: initialData?.theme || "",
            approxBudgetLabel: initialData?.approxBudgetLabel || "",
            description: initialData?.description || "",
            isFeatured: initialData?.isFeatured ?? false,
            isPublished: initialData?.isPublished ?? true,
            sortOrder: initialData?.sortOrder ?? 0,
        },
    });

    const currentUrl = watch("url");
    const currentMediaType = watch("mediaType");

    const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setServerError(null);

        try {
            const signRes = await fetch("/api/cloudinary/sign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folder: "realspace-gallery" }),
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
            const resourceType = file.type.startsWith("video") ? "video" : "image";

            const uploadRes = await fetch(
                `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`,
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

            setValue("url", uploadData.secure_url || uploadData.url);
            setValue("cloudinaryId", uploadData.public_id);
            setValue("mediaType", resourceType === "video" ? "VIDEO" : "IMAGE");
        } catch (err: any) {
            console.error("Direct upload error:", err);
            setServerError(err.message || "Failed to upload file to Cloudinary.");
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (data: ImageInput) => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            const result = isUpdate
                ? await updateImage(initialData.id!, data)
                : await createImage(data);

            if (result.success) {
                onSuccess();
            } else {
                setServerError("An error occurred while saving.");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Form submission error:", err);
            setServerError("An unexpected error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900">{isUpdate ? "Edit Gallery Image" : "Add Gallery Image"}</h3>

            {serverError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
                    {serverError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("title")}
                        className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                        placeholder="e.g. Minimalist Master Bedroom"
                    />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register("categoryId")}
                        className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
                    >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Design Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register("designType")}
                        className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
                    >
                        <option value="INTERIOR">Interior</option>
                        <option value="EXTERIOR">Exterior</option>
                    </select>
                    {errors.designType && <p className="mt-1 text-xs text-red-500">{errors.designType.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Media Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register("mediaType")}
                        className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
                    >
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video</option>
                    </select>
                    {errors.mediaType && <p className="mt-1 text-xs text-red-500">{errors.mediaType.message}</p>}
                </div>

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
                        Media File / URL <span className="text-red-500">*</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isUploading ? "Uploading..." : "Upload File (Image/Video)"}
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleDirectFileUpload}
                                disabled={isUploading}
                                className="sr-only"
                            />
                        </label>

                        <CldUploadWidget
                            signatureEndpoint="/api/cloudinary/sign"
                            options={{
                                sources: ["local", "url"],
                                folder: "realspace-gallery",
                                clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "avif", "mp4", "mov", "webm"],
                            }}
                            onSuccess={(result: any) => {
                                if (result?.info) {
                                    const secureUrl = result.info.secure_url || result.info.url;
                                    const publicId = result.info.public_id;
                                    const isVideo = result.info.resource_type === "video" ||
                                        ["mp4", "mov", "webm"].includes(result.info.format?.toLowerCase());

                                    setValue("url", secureUrl);
                                    setValue("cloudinaryId", publicId);
                                    setValue("mediaType", isVideo ? "VIDEO" : "IMAGE");
                                }
                            }}
                        >
                            {({ open }) => (
                                <button
                                    type="button"
                                    onClick={() => open()}
                                    className="px-4 py-2.5 min-h-[44px] bg-white text-neutral-700 text-sm font-medium rounded-md border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                                >
                                    Cloudinary Widget
                                </button>
                            )}
                        </CldUploadWidget>
                    </div>

                    <input
                        type="text"
                        {...register("url")}
                        className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                        placeholder="https://res.cloudinary.com/... or paste URL directly"
                    />
                    <input type="hidden" {...register("cloudinaryId")} />
                    {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url.message}</p>}

                    {/* Preview */}
                    {currentUrl && (
                        <div className="mt-2 p-2 border border-neutral-200 rounded-md bg-neutral-50 max-w-sm">
                            <p className="text-xs text-neutral-500 mb-1 font-medium flex items-center gap-1">
                                {currentMediaType === "VIDEO" ? <Film className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                                Preview ({currentMediaType}):
                            </p>
                            {currentMediaType === "VIDEO" ? (
                                <video src={currentUrl} poster={getVideoThumbnailUrl(currentUrl, "VIDEO")} controls className="w-full max-h-48 rounded object-cover" />
                            ) : (
                                <div className="relative w-full h-48 rounded overflow-hidden">
                                    <Image src={currentUrl} alt="Gallery Preview" fill className="object-cover" unoptimized={!currentUrl.includes("res.cloudinary.com")} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Theme (Optional)
                    </label>
                    <input
                        type="text"
                        {...register("theme")}
                        className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                        placeholder="e.g. Modern, Japandi, Classic"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Approx Budget Label (Optional)
                    </label>
                    <input
                        type="text"
                        {...register("approxBudgetLabel")}
                        className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                        placeholder="e.g. ₹5 Lakhs - ₹8 Lakhs"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Description (Optional)
                    </label>
                    <textarea
                        {...register("description")}
                        rows={3}
                        className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                        placeholder="Brief description of the space..."
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center min-h-[44px]">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            {...register("isFeatured")}
                            className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
                        />
                        <label htmlFor="isFeatured" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
                            Featured
                        </label>
                    </div>
                    <div className="flex items-center min-h-[44px]">
                        <input
                            type="checkbox"
                            id="isPublished"
                            {...register("isPublished")}
                            className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
                        />
                        <label htmlFor="isPublished" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
                            Published
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-neutral-100">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting || isUploading}
                    className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-white text-neutral-700 text-sm font-medium rounded-md border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-brand-red text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer"
                >
                    {isSubmitting ? "Saving..." : isUpdate ? "Save Changes" : "Create Image"}
                </button>
            </div>
        </form>
    );
}
