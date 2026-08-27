"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Megaphone, Calendar } from "lucide-react";
import { deleteOffer } from "../actions";

export type OfferData = {
    id: string;
    title?: string | null;
    description?: string | null;
    ctaLabel: string;
    ctaLink: string;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    sortOrder: number;
};

interface OfferTableClientProps {
    offers: OfferData[];
}

export function OfferTableClient({ offers }: OfferTableClientProps) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this offer?")) {
            const res = await deleteOffer(id);
            if (res.success) {
                router.refresh();
            } else {
                alert(res.error || "Failed to delete offer.");
            }
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-brand-red" /> Promotional Offers
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Manage active deals, seasonal discounts, and promotional banners.
                    </p>
                </div>
                <Link
                    href="/admin/offers/new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-brand-red text-white font-medium text-sm rounded-md hover:bg-red-700 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Add Offer
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                {offers.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <Megaphone className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-neutral-900">No offers found</h3>
                        <p className="text-sm text-neutral-500 mt-1">
                            Click &quot;Add Offer&quot; to create your first promotion.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[640px]">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-4 w-1/3">Offer Details</th>
                                    <th className="py-3.5 px-4">Validity Period</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-center">Sort Order</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 text-sm">
                                {offers.map((offer) => (
                                    <tr key={offer.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-neutral-900 mb-1">
                                                {offer.title || offer.ctaLabel || "Promotional Banner"}
                                            </div>
                                            <div className="text-xs text-neutral-500 line-clamp-1">
                                                Link: {offer.ctaLink}
                                            </div>
                                        </td>

                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                                                <span className="text-xs font-medium">
                                                    {offer.startDate || offer.endDate ? (
                                                        <>
                                                            {formatDate(offer.startDate) ?? "Start"} &mdash;{" "}
                                                            {formatDate(offer.endDate) ?? "Ongoing"}
                                                        </>
                                                    ) : (
                                                        <span className="text-neutral-400 italic">No expiry</span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${offer.isActive
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-neutral-100 text-neutral-700 border-neutral-200"
                                                    }`}
                                            >
                                                {offer.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4 text-center text-neutral-600 font-mono text-xs">
                                            {offer.sortOrder}
                                        </td>

                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/offers/${offer.id}/edit`}
                                                    className="p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-neutral-400 hover:text-brand-red transition-colors rounded hover:bg-neutral-100 cursor-pointer"
                                                    title="Edit Offer"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-neutral-400 hover:text-red-600 transition-colors rounded hover:bg-neutral-100 cursor-pointer"
                                                    title="Delete Offer"
                                                    onClick={() => handleDelete(offer.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}