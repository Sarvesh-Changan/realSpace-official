"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Star } from "lucide-react";
import { deleteTestimonial, toggleTestimonialPublish } from "../actions";

export interface Testimonial {
    id: string;
    clientName: string;
    clientRole?: string | null;
    quote: string;
    rating: number;
    isPublished: boolean;
}

interface TestimonialTableProps {
    testimonials: Testimonial[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTogglePublish: (id: string, newStatus: boolean) => void;
}

export function TestimonialTable({ testimonials, onAdd, onEdit, onDelete, onTogglePublish }: TestimonialTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
                <h2 className="text-xl font-bold text-neutral-900">Testimonials</h2>
                <button onClick={onAdd} className="inline-flex items-center px-4 py-2.5 min-h-[44px] bg-brand-red text-white text-sm font-medium rounded-md hover:bg-brand-red/90 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                                <th className="px-4 py-3.5 w-1/4">Client</th>
                                <th className="px-4 py-3.5 w-1/3">Quote</th>
                                <th className="px-4 py-3.5 w-32">Rating</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                                <th className="px-4 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-sm">
                            {testimonials.map(testimonial => (
                                <tr key={testimonial.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-4 py-3.5">
                                        <div className="font-medium text-neutral-900">{testimonial.clientName}</div>
                                        <div className="text-xs text-neutral-500">{testimonial.clientRole || "—"}</div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <p className="text-neutral-600 line-clamp-2 text-xs" title={testimonial.quote}>
                                            &quot;{testimonial.quote}&quot;
                                        </p>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`w-3.5 h-3.5 ${star <= testimonial.rating ? "fill-brand-yellow text-brand-yellow" : "text-neutral-200"}`} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer min-h-[36px] min-w-[36px] justify-center">
                                            <input type="checkbox" className="sr-only peer" checked={testimonial.isPublished} onChange={(e) => onTogglePublish(testimonial.id, e.target.checked)} />
                                            <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </td>
                                    <td className="px-4 py-3.5 text-right space-x-1">
                                        <button onClick={() => onEdit(testimonial.id)} className="text-neutral-500 hover:text-brand-red transition-colors p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded hover:bg-neutral-100 cursor-pointer" title="Edit">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDelete(testimonial.id)} className="text-neutral-500 hover:text-red-600 transition-colors p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded hover:bg-neutral-100 cursor-pointer" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {testimonials.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No testimonials found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function TestimonialTableWrapper({ testimonials }: { testimonials: Testimonial[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleAdd = () => {
        router.push("/admin/testimonials/new");
    };

    const handleEdit = (id: string) => {
        router.push(`/admin/testimonials/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;
        startTransition(async () => {
            const res = await deleteTestimonial(id);
            if (!res.success) {
                alert(res.error || "Failed to delete testimonial.");
            } else {
                router.refresh();
            }
        });
    };

    const handleTogglePublish = async (id: string, newStatus: boolean) => {
        startTransition(async () => {
            const res = await toggleTestimonialPublish(id, newStatus);
            if (!res.success) {
                alert(res.error || "Failed to toggle publish status.");
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
            <TestimonialTable
                testimonials={testimonials}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
            />
        </div>
    );
}
