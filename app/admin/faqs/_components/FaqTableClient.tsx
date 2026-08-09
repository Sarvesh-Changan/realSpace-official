"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    HelpCircle,
    Eye,
    EyeOff,
    Search,
} from "lucide-react";
import {
    createFaq,
    updateFaq,
    deleteFaq,
    toggleFaqPublish,
    reorderFaq,
    updateFaqSortOrder,
} from "../actions";
import { FaqFormModal } from "./FaqFormModal";
import type { FaqFormValues } from "../schema";

export interface FaqRecord {
    id: string;
    question: string;
    answer: string;
    sortOrder: number;
    isPublished: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface FaqTableClientProps {
    faqs: FaqRecord[];
}

export function FaqTableClient({ faqs: initialFaqs }: FaqTableClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Local state for smooth UI interaction
    const [faqsList, setFaqsList] = useState<FaqRecord[]>(initialFaqs);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FaqRecord | null>(null);

    // Sync if initialFaqs change from server
    if (JSON.stringify(initialFaqs.map(f => f.id)) !== JSON.stringify(faqsList.map(f => f.id))) {
        setFaqsList(initialFaqs);
    }

    const filteredFaqs = faqsList.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleOpenAddModal = () => {
        setEditingFaq(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (faq: FaqRecord) => {
        setEditingFaq(faq);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFaq(null);
    };

    const handleSaveFaq = async (values: FaqFormValues) => {
        if (editingFaq) {
            // Update
            const res = await updateFaq(editingFaq.id, values);
            if (!res.success) {
                alert(res.error || "Failed to update FAQ.");
            } else {
                setFaqsList((prev) =>
                    prev.map((f) =>
                        f.id === editingFaq.id ? { ...f, ...values } : f
                    )
                );
                handleCloseModal();
                startTransition(() => {
                    router.refresh();
                });
            }
        } else {
            // Create
            const res = await createFaq(values);
            if (!res.success) {
                alert(res.error || "Failed to create FAQ.");
            } else {
                if (res.id) {
                    setFaqsList((prev) => [
                        ...prev,
                        { id: res.id!, ...values },
                    ]);
                }
                handleCloseModal();
                startTransition(() => {
                    router.refresh();
                });
            }
        }
    };

    const handleDelete = async (id: string, question: string) => {
        if (!confirm(`Are you sure you want to delete this FAQ?\n\n"${question}"`)) {
            return;
        }

        setFaqsList((prev) => prev.filter((f) => f.id !== id));

        startTransition(async () => {
            const res = await deleteFaq(id);
            if (!res.success) {
                alert(res.error || "Failed to delete FAQ.");
                router.refresh();
            } else {
                router.refresh();
            }
        });
    };

    const handleTogglePublish = async (id: string, currentStatus: boolean) => {
        const nextStatus = !currentStatus;
        setFaqsList((prev) =>
            prev.map((f) => (f.id === id ? { ...f, isPublished: nextStatus } : f))
        );

        startTransition(async () => {
            const res = await toggleFaqPublish(id, nextStatus);
            if (!res.success) {
                alert(res.error || "Failed to toggle status.");
                router.refresh();
            } else {
                router.refresh();
            }
        });
    };

    const handleReorder = async (id: string, direction: "up" | "down") => {
        const index = faqsList.findIndex((f) => f.id === id);
        if (index === -1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= faqsList.length) return;

        // Swap in local state
        const updated = [...faqsList];
        const tempSort = updated[index].sortOrder;
        updated[index].sortOrder = updated[targetIndex].sortOrder;
        updated[targetIndex].sortOrder = tempSort;

        // Re-sort array
        const swappedItem = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = swappedItem;

        setFaqsList(updated);

        startTransition(async () => {
            const res = await reorderFaq(id, direction);
            if (!res.success) {
                console.error("Reorder failed:", res.error);
                router.refresh();
            } else {
                router.refresh();
            }
        });
    };

    const handleDirectSortOrderChange = async (id: string, newOrder: number) => {
        setFaqsList((prev) =>
            prev.map((f) => (f.id === id ? { ...f, sortOrder: newOrder } : f))
        );

        startTransition(async () => {
            const res = await updateFaqSortOrder(id, newOrder);
            if (!res.success) {
                alert(res.error || "Failed to update sort order.");
                router.refresh();
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-brand-red" /> FAQ Management
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Manage client questions & answers displayed on the public FAQ page.
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-semibold rounded-md hover:bg-brand-red/90 transition-colors shadow-xs w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" /> Add FAQ
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search questions or answers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-red focus:border-brand-red text-neutral-900 placeholder:text-neutral-400"
                    />
                </div>
                <div className="text-xs text-neutral-500 font-medium self-end sm:self-center">
                    Total: <strong className="text-neutral-900">{faqsList.length}</strong> FAQs
                </div>
            </div>

            {/* Table Section */}
            <div
                className={`bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden ${isPending ? "opacity-75 transition-opacity" : ""
                    }`}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                <th className="py-3 px-4 w-16 text-center">Order</th>
                                <th className="py-3 px-4 w-2/5">Question</th>
                                <th className="py-3 px-4 w-2/5">Answer Preview</th>
                                <th className="py-3 px-4 text-center w-24">Status</th>
                                <th className="py-3 px-4 text-right w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-sm">
                            {filteredFaqs.map((faq, index) => (
                                <tr
                                    key={faq.id}
                                    className="hover:bg-neutral-50/70 transition-colors"
                                >
                                    {/* Order Controls */}
                                    <td className="py-3 px-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => handleReorder(faq.id, "up")}
                                                    disabled={index === 0}
                                                    title="Move up"
                                                    className="p-0.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 transition-colors"
                                                >
                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReorder(faq.id, "down")}
                                                    disabled={index === filteredFaqs.length - 1}
                                                    title="Move down"
                                                    className="p-0.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 transition-colors"
                                                >
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <input
                                                type="number"
                                                value={faq.sortOrder}
                                                onChange={(e) =>
                                                    handleDirectSortOrderChange(
                                                        faq.id,
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                className="w-10 text-center py-0.5 px-1 border border-neutral-200 rounded text-xs font-mono font-medium text-neutral-700 focus:ring-1 focus:ring-brand-red focus:border-brand-red"
                                            />
                                        </div>
                                    </td>

                                    {/* Question Column */}
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-neutral-900 line-clamp-2 leading-snug">
                                            {faq.question}
                                        </div>
                                    </td>

                                    {/* Answer Preview Column */}
                                    <td className="py-3 px-4">
                                        <p
                                            className="text-neutral-600 text-xs line-clamp-2 leading-relaxed"
                                            title={faq.answer}
                                        >
                                            {faq.answer}
                                        </p>
                                    </td>

                                    {/* Status Toggle Column */}
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => handleTogglePublish(faq.id, faq.isPublished)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${faq.isPublished
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                    : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
                                                }`}
                                            title={
                                                faq.isPublished
                                                    ? "Click to unpublish"
                                                    : "Click to publish"
                                            }
                                        >
                                            {faq.isPublished ? (
                                                <>
                                                    <Eye className="w-3 h-3 text-emerald-600" />
                                                    Published
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="w-3 h-3 text-neutral-400" />
                                                    Hidden
                                                </>
                                            )}
                                        </button>
                                    </td>

                                    {/* Actions Column */}
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleOpenEditModal(faq)}
                                                className="p-1.5 rounded text-neutral-500 hover:text-brand-red hover:bg-red-50 transition-colors"
                                                title="Edit FAQ"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(faq.id, faq.question)}
                                                className="p-1.5 rounded text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Delete FAQ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredFaqs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-neutral-500">
                                        <HelpCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium">No FAQs found.</p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            {searchTerm
                                                ? "Try clearing your search term filter."
                                                : "Click 'Add FAQ' above to create your first question."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            <FaqFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSaveFaq}
                initialData={
                    editingFaq
                        ? {
                            id: editingFaq.id,
                            question: editingFaq.question,
                            answer: editingFaq.answer,
                            sortOrder: editingFaq.sortOrder,
                            isPublished: editingFaq.isPublished,
                        }
                        : null
                }
                title={editingFaq ? "Edit FAQ" : "Add New FAQ"}
            />
        </div>
    );
}
