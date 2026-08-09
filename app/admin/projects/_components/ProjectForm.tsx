"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/Button";
import { projectSchema, type ProjectInput } from "../schema";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export function ProjectForm({
    initialData,
    onSubmitAction
}: {
    initialData?: ProjectInput,
    onSubmitAction: (data: ProjectInput) => Promise<{ success: boolean; error?: string }>
}) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ProjectInput>({
        resolver: zodResolver(projectSchema),
        defaultValues: initialData || {
            title: "",
            slug: "",
            designType: "INTERIOR",
            propertyType: "RESIDENTIAL",
            category: "FULL_HOME",
            location: "",
            description: "",
            servicesUsed: [],
            carpetAreaSqFt: null,
            completionYear: null,
            isFeatured: false,
            isPublished: true,
            sortOrder: 0,
            images: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "images",
    });

    // Service tags management
    const [serviceInput, setServiceInput] = useState("");
    const servicesUsed = useWatch({ name: "servicesUsed", control }) || [];

    const addServiceTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = serviceInput.trim();
            if (val && !servicesUsed.includes(val)) {
                setValue("servicesUsed", [...servicesUsed, val], { shouldValidate: true });
            }
            setServiceInput("");
        }
    };

    const removeServiceTag = (tag: string) => {
        setValue("servicesUsed", servicesUsed.filter((t) => t !== tag), { shouldValidate: true });
    };

    // Direct Signed Cloudinary File Upload handler
    const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setServerError(null);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // 1. Fetch signature from API endpoint per SECURITY.md §4
                const signRes = await fetch("/api/cloudinary/sign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paramsToSign: {} }),
                });

                if (!signRes.ok) {
                    const errJson = await signRes.json().catch(() => ({}));
                    throw new Error(errJson.error || "Failed to get upload signature from server.");
                }

                const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

                // 2. Upload file directly from browser to Cloudinary
                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
                formData.append("timestamp", timestamp.toString());
                formData.append("signature", signature);
                formData.append("folder", folder || "realspace-projects");

                const targetCloud = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dipeupebc";
                const uploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${targetCloud}/auto/upload`,
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

                // 3. Append returned secure_url and public_id to images field array
                append({
                    url: uploadData.secure_url || uploadData.url,
                    cloudinaryId: uploadData.public_id,
                    altText: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
                    isCoverImage: fields.length === 0 && i === 0,
                    sortOrder: fields.length + i,
                });
            }
        } catch (err: any) {
            console.error("Direct upload error:", err);
            setServerError(err.message || "Failed to upload image to Cloudinary.");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const onSubmit = async (data: ProjectInput) => {
        setServerError(null);
        setIsSubmitting(true);

        if (!data.slug) {
            data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        try {
            const result = await onSubmitAction(data);
            if (!result.success) {
                setServerError(result.error || "Failed to save project.");
            } else {
                router.push("/admin/projects");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            setServerError("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
            {serverError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
                    {serverError}
                </div>
            )}

            {/* Basic Details */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                    Basic Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                        <input
                            {...register("title")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none text-sm"
                            placeholder="e.g. Modern Villa in Majiwada"
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
                        <input
                            {...register("slug")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none text-sm"
                            placeholder="modern-villa-majiwada"
                        />
                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Design Type</label>
                        <select
                            {...register("designType")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none bg-white text-sm"
                        >
                            <option value="INTERIOR">Interior</option>
                            <option value="EXTERIOR">Exterior</option>
                        </select>
                        {errors.designType && <p className="text-red-500 text-xs mt-1">{errors.designType.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Property Type</label>
                        <select
                            {...register("propertyType")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none bg-white text-sm"
                        >
                            <option value="RESIDENTIAL">Residential</option>
                            <option value="COMMERCIAL">Commercial</option>
                        </select>
                        {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                        <select
                            {...register("category")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none bg-white text-sm"
                        >
                            <option value="KITCHEN">Kitchen</option>
                            <option value="LIVING_ROOM">Living Room</option>
                            <option value="BEDROOM">Bedroom</option>
                            <option value="FULL_HOME">Full Home</option>
                            <option value="VILLA">Villa</option>
                            <option value="OFFICE">Office</option>
                            <option value="BUILDING_EXTERIOR">Building Exterior</option>
                            <option value="FACADE_ELEVATION">Facade / Elevation</option>
                            <option value="BALCONY_TERRACE">Balcony / Terrace</option>
                            <option value="OUTDOOR_SPACE">Outdoor Space</option>
                            <option value="RENOVATION">Renovation</option>
                            <option value="OTHER">Other</option>
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
                        <input
                            {...register("location")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none text-sm"
                            placeholder="e.g. Majiwada, Thane"
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Carpet Area (SqFt)</label>
                        <input
                            type="number"
                            {...register("carpetAreaSqFt", { valueAsNumber: true })}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none text-sm"
                            placeholder="e.g. 1200"
                        />
                        {errors.carpetAreaSqFt && <p className="text-red-500 text-xs mt-1">{errors.carpetAreaSqFt.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Completion Year</label>
                        <input
                            type="number"
                            {...register("completionYear", { valueAsNumber: true })}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none text-sm"
                            placeholder="e.g. 2023"
                        />
                        {errors.completionYear && <p className="text-red-500 text-xs mt-1">{errors.completionYear.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                    <textarea
                        {...register("description")}
                        rows={4}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none resize-y text-sm"
                        placeholder="Describe the project..."
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Services Used (Press Enter to add)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {servicesUsed.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-xs border border-neutral-200">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeServiceTag(tag)}
                                    className="text-neutral-500 hover:text-red-500 focus:outline-none"
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        value={serviceInput}
                        onChange={(e) => setServiceInput(e.target.value)}
                        onKeyDown={addServiceTag}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none text-sm"
                        placeholder="e.g. Modular Kitchen, False Ceiling..."
                    />
                </div>

                <div className="flex gap-6 pt-4 border-t border-neutral-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register("isFeatured")}
                            className="rounded text-brand-red focus:ring-brand-red"
                        />
                        <span className="text-sm font-medium text-neutral-700">Featured (Show on Home)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register("isPublished")}
                            className="rounded text-brand-red focus:ring-brand-red"
                        />
                        <span className="text-sm font-medium text-neutral-700">Published (Visible)</span>
                    </label>
                </div>
            </div>

            {/* Cloudinary Media Section */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-brand-red" /> Cloudinary Media Handling
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Direct signed upload to Cloudinary folder <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-700 font-mono">realspace-projects</code>.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Direct File Upload */}
                        <label className="relative inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-red hover:bg-red-700 rounded-md shadow-sm cursor-pointer transition-colors disabled:opacity-50">
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            {isUploading ? "Uploading..." : "Upload File(s)"}
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleDirectFileUpload}
                                disabled={isUploading}
                                className="sr-only"
                            />
                        </label>

                        {/* Cloudinary Widget Alternative */}
                        <CldUploadWidget
                            signatureEndpoint="/api/cloudinary/sign"
                            options={{
                                sources: ["local", "url"],
                                folder: "realspace-projects",
                                clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "avif", "mp4", "mov"],
                            }}
                            onSuccess={(result: any) => {
                                if (result?.info) {
                                    append({
                                        url: result.info.secure_url || result.info.url,
                                        cloudinaryId: result.info.public_id,
                                        altText: result.info.original_filename || "Project media",
                                        isCoverImage: fields.length === 0,
                                        sortOrder: fields.length,
                                    });
                                }
                            }}
                        >
                            {({ open }) => (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => open()}
                                >
                                    <Plus className="w-4 h-4" /> Widget Upload
                                </Button>
                            )}
                        </CldUploadWidget>
                    </div>
                </div>

                {errors.images && (
                    <p className="text-red-500 text-xs">{errors.images.message}</p>
                )}

                <div className="space-y-4">
                    {fields.map((field, index) => {
                        const currentUrl = useWatch({ name: `images.${index}.url`, control }) || field.url;
                        const currentCloudinaryId = useWatch({ name: `images.${index}.cloudinaryId`, control }) || field.cloudinaryId;
                        const isCover = useWatch({ name: `images.${index}.isCoverImage`, control });

                        return (
                            <div key={field.id} className="flex flex-col md:flex-row items-start gap-4 p-4 border border-neutral-200 rounded-md bg-neutral-50/50">
                                <div className="pt-2 text-neutral-400 cursor-move hidden md:block">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                {/* Thumbnail Preview */}
                                <div className="relative w-24 h-24 rounded-md overflow-hidden bg-neutral-200 border border-neutral-300 flex-shrink-0">
                                    {currentUrl ? (
                                        <Image
                                            src={getCloudinaryUrl(currentUrl, { width: 200, height: 200, crop: "fill" })}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                            unoptimized={!currentUrl.includes("res.cloudinary.com")}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                                            No preview
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                                            Cloudinary Public ID
                                        </label>
                                        <input
                                            {...register(`images.${index}.cloudinaryId`)}
                                            readOnly
                                            className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-xs text-neutral-600 font-mono outline-none cursor-not-allowed"
                                        />
                                        {errors.images?.[index]?.cloudinaryId && (
                                            <p className="text-red-500 text-xs mt-1">{errors.images[index]?.cloudinaryId?.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                                            Alt Text (Required for accessibility)
                                        </label>
                                        <input
                                            {...register(`images.${index}.altText`)}
                                            className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
                                            placeholder="Describe image content..."
                                        />
                                        {errors.images?.[index]?.altText && (
                                            <p className="text-red-500 text-xs mt-1">{errors.images[index]?.altText?.message}</p>
                                        )}
                                    </div>

                                    <input type="hidden" {...register(`images.${index}.url`)} />
                                    <input type="hidden" {...register(`images.${index}.sortOrder`, { valueAsNumber: true })} />

                                    <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-neutral-200/60">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                                            <input
                                                type="radio"
                                                name="coverImageRadio"
                                                checked={Boolean(isCover)}
                                                onChange={() => {
                                                    fields.forEach((_, i) => setValue(`images.${i}.isCoverImage`, i === index));
                                                }}
                                                className="text-brand-red focus:ring-brand-red"
                                            />
                                            <span className={`text-xs font-medium ${isCover ? "text-brand-red font-bold" : "text-neutral-600"}`}>
                                                {isCover ? "★ Main Cover Image" : "Set as Cover Image"}
                                            </span>
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-neutral-500 hover:text-red-600 flex items-center gap-1 text-xs font-medium transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {fields.length === 0 && (
                        <div className="text-center py-10 text-neutral-500 text-sm bg-neutral-50 rounded-md border border-neutral-200 border-dashed">
                            <ImageIcon className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                            No images added yet. Click &quot;Upload File(s)&quot; or &quot;Widget Upload&quot; to add Cloudinary media.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting || isUploading}
                >
                    {isSubmitting ? "Saving..." : "Save Project"}
                </Button>
            </div>
        </form>
    );
}
