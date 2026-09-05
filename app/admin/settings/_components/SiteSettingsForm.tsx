"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { siteSettingsSchema, type SiteSettingsInput } from "../schema";
import { updateSiteSettings } from "../actions";

export function SiteSettingsForm({ initialData }: { initialData: SiteSettingsInput }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingPortrait, setIsUploadingPortrait] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SiteSettingsInput>({
        resolver: zodResolver(siteSettingsSchema),
        defaultValues: initialData,
    });

    const currentPortraitUrl = watch("ownerPortraitUrl");

    const handlePortraitFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingPortrait(true);
        setMessage(null);

        try {
            const signRes = await fetch("/api/cloudinary/sign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folder: "realspace-owner" }),
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
                throw new Error(uploadErr.error?.message || "Cloudinary upload failed.");
            }

            const uploadData = await uploadRes.json();

            setValue("ownerPortraitUrl", uploadData.secure_url || uploadData.url);
            setValue("ownerPortraitPublicId", uploadData.public_id);
        } catch (err: any) {
            console.error("Portrait upload error:", err);
            setMessage({ type: "error", text: err.message || "Failed to upload owner portrait." });
        } finally {
            setIsUploadingPortrait(false);
        }
    };

    const handleRemovePortrait = () => {
        setValue("ownerPortraitUrl", "");
        setValue("ownerPortraitPublicId", "");
    };

    const onSubmit = async (data: SiteSettingsInput) => {
        setIsSubmitting(true);
        setMessage(null);

        const result = await updateSiteSettings(data);

        if (result.success) {
            setMessage({ type: 'success', text: "Settings saved successfully." });
        } else {
            setMessage({ type: 'error', text: result.error || "Something went wrong." });
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-4xl">
            {message && (
                <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Company Details</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Company Name</label>
                    <input type="text" {...register("companyName")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Email Address</label>
                    <input type="email" {...register("email")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Phone Number</label>
                    <input type="text" {...register("phone")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">WhatsApp Number</label>
                    <input type="text" {...register("whatsapp")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.whatsapp && <p className="mt-1 text-xs text-red-500">{errors.whatsapp.message}</p>}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Studio Address</label>
                    <textarea {...register("address")} rows={3} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
                </div>

                {/* Owner Portrait Section */}
                <div className="sm:col-span-2 mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-2 gap-2">
                        <h2 className="text-lg font-semibold text-neutral-900">
                            Owner Portrait
                        </h2>
                        <div className="flex items-center gap-2">
                            <input
                                id="showOwnerPortrait"
                                type="checkbox"
                                {...register("showOwnerPortrait")}
                                className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500 cursor-pointer"
                            />
                            <label htmlFor="showOwnerPortrait" className="text-sm font-medium text-neutral-900 cursor-pointer">
                                Display Section on Home Page
                            </label>
                        </div>
                    </div>

                    <p className="text-xs text-neutral-500">
                        Recommended: landscape orientation, at least 1200px wide for optimal home page display.
                    </p>

                    {currentPortraitUrl ? (
                        <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="relative w-48 h-28 rounded-md overflow-hidden border border-neutral-200 shrink-0 bg-neutral-900">
                                <Image
                                    src={currentPortraitUrl}
                                    alt="Owner Portrait Preview"
                                    fill
                                    sizes="192px"
                                    className="object-contain"
                                    unoptimized={!currentPortraitUrl.includes("res.cloudinary.com")}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleRemovePortrait}
                                    disabled={isUploadingPortrait || isSubmitting}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] bg-white border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50">
                                {isUploadingPortrait ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {isUploadingPortrait ? "Uploading Portrait..." : "Upload Portrait Image"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePortraitFileUpload}
                                    disabled={isUploadingPortrait || isSubmitting}
                                    className="sr-only"
                                />
                            </label>
                        </div>
                    )}

                    <input type="hidden" {...register("ownerPortraitUrl")} />
                    <input type="hidden" {...register("ownerPortraitPublicId")} />
                </div>

                <div className="sm:col-span-2 mt-4">
                    <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Hero Section Content</h2>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Hero Headline</label>
                    <input type="text" {...register("heroHeadline")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.heroHeadline && <p className="mt-1 text-xs text-red-500">{errors.heroHeadline.message}</p>}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Hero Subhead</label>
                    <textarea {...register("heroSubhead")} rows={3} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.heroSubhead && <p className="mt-1 text-xs text-red-500">{errors.heroSubhead.message}</p>}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Primary CTA Text</label>
                    <input type="text" {...register("ctaText")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.ctaText && <p className="mt-1 text-xs text-red-500">{errors.ctaText.message}</p>}
                </div>

                <div className="sm:col-span-2 mt-4">
                    <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Social Links</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Instagram URL</label>
                    <input type="text" {...register("instagram")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" placeholder="https://instagram.com/..." />
                    {errors.instagram && <p className="mt-1 text-xs text-red-500">{errors.instagram.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Facebook URL</label>
                    <input type="text" {...register("facebook")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" placeholder="https://facebook.com/..." />
                    {errors.facebook && <p className="mt-1 text-xs text-red-500">{errors.facebook.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">YouTube URL</label>
                    <input type="text" {...register("youtube")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" placeholder="https://youtube.com/..." />
                    {errors.youtube && <p className="mt-1 text-xs text-red-500">{errors.youtube.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">LinkedIn Profile URL</label>
                    <input type="text" {...register("linkedin")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" placeholder="https://linkedin.com/in/..." />
                    {errors.linkedin && <p className="mt-1 text-xs text-red-500">{errors.linkedin.message}</p>}
                </div>
            </div>

            <div className="pt-6 border-t border-neutral-200">
                <button
                    type="submit"
                    disabled={isSubmitting || isUploadingPortrait}
                    className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-red-600 text-white font-medium text-sm rounded-md hover:bg-red-500 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}