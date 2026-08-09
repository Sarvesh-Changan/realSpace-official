"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingsSchema, type SiteSettingsInput } from "../schema";
import { updateSiteSettings } from "../actions";

export function SiteSettingsForm({ initialData }: { initialData: SiteSettingsInput }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<SiteSettingsInput>({
        resolver: zodResolver(siteSettingsSchema),
        defaultValues: initialData,
    });

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
                    <input type="text" {...register("companyName")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Email Address</label>
                    <input type="email" {...register("email")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Phone Number</label>
                    <input type="text" {...register("phone")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">WhatsApp Number</label>
                    <input type="text" {...register("whatsapp")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.whatsapp && <p className="mt-1 text-xs text-red-500">{errors.whatsapp.message}</p>}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Studio Address</label>
                    <textarea {...register("address")} rows={3} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
                </div>

                <div className="sm:col-span-2 mt-4">
                    <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Hero Section Content</h2>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Hero Headline</label>
                    <input type="text" {...register("heroHeadline")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.heroHeadline && <p className="mt-1 text-xs text-red-500">{errors.heroHeadline.message}</p>}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Hero Subhead</label>
                    <textarea {...register("heroSubhead")} rows={3} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.heroSubhead && <p className="mt-1 text-xs text-red-500">{errors.heroSubhead.message}</p>}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Primary CTA Text</label>
                    <input type="text" {...register("ctaText")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                    {errors.ctaText && <p className="mt-1 text-xs text-red-500">{errors.ctaText.message}</p>}
                </div>

                <div className="sm:col-span-2 mt-4">
                    <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Social Links</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Instagram URL</label>
                    <input type="text" {...register("instagram")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" placeholder="https://instagram.com/..." />
                    {errors.instagram && <p className="mt-1 text-xs text-red-500">{errors.instagram.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Facebook URL</label>
                    <input type="text" {...register("facebook")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" placeholder="https://facebook.com/..." />
                    {errors.facebook && <p className="mt-1 text-xs text-red-500">{errors.facebook.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">YouTube URL</label>
                    <input type="text" {...register("youtube")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" placeholder="https://youtube.com/..." />
                    {errors.youtube && <p className="mt-1 text-xs text-red-500">{errors.youtube.message}</p>}
                </div>
            </div>

            <div className="pt-6 border-t border-neutral-200">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-red-600 text-white font-medium text-sm rounded-md hover:bg-red-500 transition-colors shadow-sm disabled:opacity-50"
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}