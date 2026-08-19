"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Award } from "lucide-react";
import { deleteCertification, toggleCertificationStatus } from "../actions";

export type CertificationData = {
    id: string;
    title: string;
    issuingBody: string;
    certificateType: "COURSE" | "MEMBERSHIP" | "REGISTRATION";
    badgeLabel: string;
    isPublished: boolean;
    sortOrder: number;
};

interface CertificationTableClientProps {
    certifications: CertificationData[];
}

export function CertificationTableClient({ certifications }: CertificationTableClientProps) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this certification?")) {
            const res = await deleteCertification(id);
            if (res.success) {
                router.refresh();
            } else {
                alert(res.error || "Failed to delete certification.");
            }
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const res = await toggleCertificationStatus(id, !currentStatus);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error || "Failed to update status.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Award className="w-6 h-6 text-brand-red" /> Certifications
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Manage awards, memberships, and professional registrations.
                    </p>
                </div>
                <Link
                    href="/admin/certifications/new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-red text-white font-medium text-sm rounded-md hover:bg-red-700 transition-colors shadow-sm self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" /> Add Certification
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                {certifications.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <Award className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-neutral-900">No certifications found</h3>
                        <p className="text-sm text-neutral-500 mt-1">
                            Click &quot;Add Certification&quot; to create your first record.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-4 w-1/3">Title & Issuing Body</th>
                                    <th className="py-3.5 px-4">Type</th>
                                    <th className="py-3.5 px-4">Badge Label</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-center">Sort Order</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 text-sm">
                                {certifications.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-neutral-900 mb-1">{cert.title}</div>
                                            <div className="text-xs text-neutral-500 pr-4">
                                                {cert.issuingBody}
                                            </div>
                                        </td>

                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                                {cert.certificateType}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4 text-neutral-600 font-medium text-sm">
                                            {cert.badgeLabel}
                                        </td>

                                        <td className="py-4 px-4">
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(cert.id, cert.isPublished)}
                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 transition-colors ${cert.isPublished ? "bg-brand-red" : "bg-neutral-300"
                                                    }`}
                                                role="switch"
                                                aria-checked={cert.isPublished}
                                            >
                                                <span className="sr-only">Toggle publish status</span>
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cert.isPublished ? "translate-x-2" : "-translate-x-2"
                                                        }`}
                                                />
                                            </button>
                                        </td>

                                        <td className="py-4 px-4 text-center text-neutral-600 font-mono text-xs">
                                            {cert.sortOrder}
                                        </td>

                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/certifications/${cert.id}/edit`}
                                                    className="p-1.5 text-neutral-400 hover:text-brand-red transition-colors rounded"
                                                    title="Edit Certification"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors rounded"
                                                    title="Delete Certification"
                                                    onClick={() => handleDelete(cert.id)}
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
