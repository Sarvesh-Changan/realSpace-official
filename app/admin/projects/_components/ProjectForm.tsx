"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { projectSchema, type ProjectInput } from "../schema";

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

    // Simple service tags management
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

    const onSubmit = async (data: ProjectInput) => {
        setServerError(null);
        setIsSubmitting(true);

        // Automatically generate a slug if empty
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
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                    {serverError}
                </div>
            )}

            {/* Main Details */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                    Basic Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                        <input
                            {...register("title")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
                            placeholder="e.g. Modern Villa in Majiwada"
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
                        <input
                            {...register("slug")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
                            placeholder="modern-villa-majiwada"
                        />
                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Design Type</label>
                        <select
                            {...register("designType")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none bg-white"
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
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none bg-white"
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
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none bg-white"
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
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
                            placeholder="e.g. Majiwada, Thane"
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Carpet Area (SqFt)</label>
                        <input
                            type="number"
                            {...register("carpetAreaSqFt", { valueAsNumber: true })}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
                            placeholder="e.g. 1200"
                        />
                        {errors.carpetAreaSqFt && <p className="text-red-500 text-xs mt-1">{errors.carpetAreaSqFt.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Completion Year</label>
                        <input
                            type="number"
                            {...register("completionYear", { valueAsNumber: true })}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
                            placeholder="e.g. 2023"
                        />
                        {errors.completionYear && <p className="text-red-500 text-xs mt-1">{errors.completionYear.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                    <textarea
                        {...register("description")}
                        rows={5}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none resize-y"
                        placeholder="Describe the project..."
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Services Used (Press Enter to add)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {servicesUsed.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-sm border border-neutral-200">
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
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
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

            {/* Images Section */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" /> Project Images
                    </h2>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-2"
                        onClick={() => append({
                            url: "",
                            cloudinaryId: `placeholder-${Date.now()}`, // Temporary placeholder
                            altText: "",
                            isCoverImage: fields.length === 0,
                            sortOrder: fields.length
                        })}
                    >
                        <Plus className="w-4 h-4" /> Add Image
                    </Button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-4 p-4 border border-neutral-200 rounded-md bg-neutral-50">
                            <div className="pt-2 text-neutral-400 cursor-move">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-700 mb-1">Image URL</label>
                                    <input
                                        {...register(`images.${index}.url`)}
                                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
                                        placeholder="https://..."
                                    />
                                    {errors.images?.[index]?.url && (
                                        <p className="text-red-500 text-xs mt-1">{errors.images[index]?.url?.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-700 mb-1">Alt Text (Required)</label>
                                    <input
                                        {...register(`images.${index}.altText`)}
                                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
                                        placeholder="Describe image for accessibility"
                                    />
                                    {errors.images?.[index]?.altText && (
                                        <p className="text-red-500 text-xs mt-1">{errors.images[index]?.altText?.message}</p>
                                    )}
                                </div>
                                {/* Hidden cloudinaryId field for the form, will be replaced with real upload later */}
                                <input type="hidden" {...register(`images.${index}.cloudinaryId`)} />
                                <div className="md:col-span-2 flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            name={`images.${index}.isCoverImage`}
                                            checked={field.isCoverImage || false}
                                            onChange={() => {
                                                // Set all to false, then this one to true
                                                fields.forEach((_, i) => setValue(`images.${i}.isCoverImage`, i === index));
                                            }}
                                            className="text-brand-red focus:ring-brand-red"
                                        />
                                        Cover Image
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-neutral-500 hover:text-red-600 flex items-center gap-1 text-sm font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" /> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <div className="text-center py-8 text-neutral-500 text-sm bg-neutral-50 rounded-md border border-neutral-200 border-dashed">
                            No images added yet. Click &quot;Add Image&quot; to start.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : "Save Project"}
                </Button>
            </div>
        </form>
    );
}
