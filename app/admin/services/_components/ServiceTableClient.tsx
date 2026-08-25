"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { deleteService, toggleServicePublish } from "../actions";

export interface Service {
    id: string;
    title: string;
    designType: "INTERIOR" | "EXTERIOR";
    iconKey?: string | null;
    sortOrder: number;
    isPublished: boolean;
}

interface ServiceTableProps {
    services: Service[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTogglePublish: (id: string, newStatus: boolean) => void;
}

export function ServiceTable({ services, onAdd, onEdit, onDelete, onTogglePublish }: ServiceTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
                <h2 className="text-xl font-bold text-neutral-900">Services</h2>
                <button onClick={onAdd} className="inline-flex items-center px-4 py-2.5 min-h-[44px] bg-brand-red text-white text-sm font-medium rounded-md hover:bg-brand-red/90 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" /> Add Service
                </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                                <th className="px-4 py-3.5">Title</th>
                                <th className="px-4 py-3.5">Type</th>
                                <th className="px-4 py-3.5">Icon</th>
                                <th className="px-4 py-3.5 text-center">Sort Order</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                                <th className="px-4 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-sm">
                            {services.map(service => (
                                <tr key={service.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-4 py-3.5 font-medium text-neutral-900">{service.title}</td>
                                    <td className="px-4 py-3.5">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${service.designType === 'INTERIOR' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {service.designType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-neutral-500">{service.iconKey || "—"}</td>
                                    <td className="px-4 py-3.5 text-center text-neutral-500">{service.sortOrder}</td>
                                    <td className="px-4 py-3.5 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer min-h-[36px] min-w-[36px] justify-center">
                                            <input type="checkbox" className="sr-only peer" checked={service.isPublished} onChange={(e) => onTogglePublish(service.id, e.target.checked)} />
                                            <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </td>
                                    <td className="px-4 py-3.5 text-right space-x-1">
                                        <button onClick={() => onEdit(service.id)} className="text-neutral-500 hover:text-brand-red transition-colors p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded hover:bg-neutral-100 cursor-pointer" title="Edit">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDelete(service.id)} className="text-neutral-500 hover:text-red-600 transition-colors p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded hover:bg-neutral-100 cursor-pointer" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {services.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No services found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function ServiceTableWrapper({ services }: { services: Service[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleAdd = () => {
        router.push("/admin/services/new");
    };

    const handleEdit = (id: string) => {
        router.push(`/admin/services/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        startTransition(async () => {
            const res = await deleteService(id);
            if (!res.success) {
                alert(res.error || "Failed to delete service.");
            } else {
                router.refresh();
            }
        });
    };

    const handleTogglePublish = async (id: string, newStatus: boolean) => {
        startTransition(async () => {
            const res = await toggleServicePublish(id, newStatus);
            if (!res.success) {
                alert(res.error || "Failed to toggle publish status.");
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
            <ServiceTable
                services={services}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
            />
        </div>
    );
}