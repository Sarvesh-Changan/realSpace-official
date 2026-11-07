"use client";

import { useState } from "react";
import Link from "next/link";
import { updateLeadStatus } from "../actions";
import { LeadDetail } from "./LeadDetail";
import { Eye, Calculator, Mail, MessageCircle } from "lucide-react";
import type { LeadSource, LeadStatus } from "@prisma/client";

export type LeadData = {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    location: string | null;
    requirements: string | null;
    source: LeadSource;
    selections: any | null;
    estimatedBudget?: number | null;
    estimatedBudgetLow: number | null;
    estimatedBudgetHigh: number | null;
    status: LeadStatus;
    notes: string | null;
    createdAt: Date;
};

export function LeadTableClient({ leads }: { leads: LeadData[] }) {
    const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        await updateLeadStatus(id, newStatus as LeadStatus);
        setUpdatingId(null);
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case "QUOTE_CALCULATOR":
                return <Calculator className="w-4 h-4 text-amber-500" />;
            case "CONTACT_FORM":
                return <Mail className="w-4 h-4 text-red-500" />;
            case "WHATSAPP_CLICK":
                return <MessageCircle className="w-4 h-4 text-green-500" />;
            default:
                return null;
        }
    };

    const formatSource = (source: string) => {
        return source.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return "—";
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumSignificantDigits: 3 }).format(amount);
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                {leads.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <h3 className="text-lg font-medium text-neutral-900">No leads found</h3>
                        <p className="text-sm text-neutral-500 mt-1">
                            When users submit forms or use the calculator, they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Lead Info</th>
                                    <th className="py-3.5 px-4">Source</th>
                                    <th className="py-3.5 px-4">Est. Budget</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Date</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 text-sm">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-medium text-neutral-900">{lead.name}</div>
                                            <div className="text-xs text-neutral-500">{lead.phone}</div>
                                            {lead.email && <div className="text-xs text-neutral-500">{lead.email}</div>}
                                        </td>

                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                {getSourceIcon(lead.source)}
                                                <span className="text-xs font-medium text-neutral-700 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                                                    {formatSource(lead.source)}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 text-neutral-600 font-medium">
                                            {lead.selections?.flowType === "commercial" || lead.selections?.bhkType === "Commercial & Others" ? (
                                                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block">
                                                    Custom quote — see details
                                                </span>
                                            ) : lead.estimatedBudget != null ? (
                                                formatCurrency(lead.estimatedBudget)
                                            ) : lead.estimatedBudgetLow && lead.estimatedBudgetHigh ? (
                                                `${formatCurrency(lead.estimatedBudgetLow)} - ${formatCurrency(lead.estimatedBudgetHigh)}`
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td className="py-4 px-4">
                                            <select
                                                disabled={updatingId === lead.id}
                                                value={lead.status}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                className={`text-xs font-medium rounded border px-2 py-1 outline-none transition-colors ${lead.status === "NEW" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        lead.status === "CONTACTED" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                            lead.status === "CONVERTED" ? "bg-green-50 text-green-700 border-green-200" :
                                                                "bg-neutral-100 text-neutral-600 border-neutral-200"
                                                    }`}
                                            >
                                                <option value="NEW">New</option>
                                                <option value="CONTACTED">Contacted</option>
                                                <option value="CONVERTED">Converted</option>
                                                <option value="CLOSED">Closed</option>
                                            </select>
                                        </td>

                                        <td className="py-4 px-4 text-neutral-500 text-xs">
                                            {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </td>

                                        <td className="py-4 px-4 text-right">
                                            <Link
                                                href={`/admin/leads/${lead.id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors shadow-sm"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedLead && (
                <LeadDetail
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onNotesUpdated={(id, notes) => {
                        const index = leads.findIndex(l => l.id === id);
                        if (index > -1) {
                            leads[index].notes = notes;
                        }
                    }}
                />
            )}
        </>
    );
}