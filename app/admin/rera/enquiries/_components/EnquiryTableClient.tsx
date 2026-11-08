"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Building2,
  Calendar,
  Filter,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { updateEnquiryStatus } from "../actions";
import type { LeadStatus } from "@prisma/client";

export interface EnquiryRow {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  interestedIn: "BUY" | "SELL" | "RENT" | "OTHER";
  budgetLabel?: string | null;
  locality?: string | null;
  message?: string | null;
  source: "CONTACT_FORM" | "CALLBACK" | "PROPERTY_ENQUIRY" | "POST_PROPERTY" | "SITE_VISIT";
  property?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  status: LeadStatus;
  notes?: string | null;
  createdAt: Date | string;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  CONTACT_FORM: {
    label: "Contact",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  CALLBACK: {
    label: "Callback",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PROPERTY_ENQUIRY: {
    label: "Property Enquiry",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  POST_PROPERTY: {
    label: "Post Property",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  SITE_VISIT: {
    label: "Site Visit",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-purple-50 text-purple-700 border-purple-200",
  CONVERTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export function EnquiryTableClient({ enquiries }: { enquiries: EnquiryRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;
    const matchesSource =
      sourceFilter === "ALL" || item.source === sourceFilter;
    return matchesStatus && matchesSource;
  });

  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    setUpdatingId(id);
    startTransition(async () => {
      await updateEnquiryStatus(id, newStatus);
      setUpdatingId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-neutral-800" /> RERA Enquiries
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Track inquiries, visit bookings, and post-property submissions from the RERA website.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200">
            Total: {enquiries.length}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            New: {enquiries.filter((e) => e.status === "NEW").length}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-md border border-neutral-300 px-3 py-1.5 bg-white text-neutral-700 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CONVERTED">Converted</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs rounded-md border border-neutral-300 px-3 py-1.5 bg-white text-neutral-700 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 cursor-pointer"
          >
            <option value="ALL">All Sources</option>
            <option value="CONTACT_FORM">Contact</option>
            <option value="CALLBACK">Callback</option>
            <option value="PROPERTY_ENQUIRY">Property Enquiry</option>
            <option value="POST_PROPERTY">Post Property</option>
            <option value="SITE_VISIT">Site Visit</option>
          </select>
        </div>

        <div className="text-xs text-neutral-500">
          Showing {filteredEnquiries.length} of {enquiries.length}
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-900">
              No enquiries found
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              No enquiries match the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Interest & Budget</th>
                  <th className="py-3.5 px-4">Locality</th>
                  <th className="py-3.5 px-4">Linked Property</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Received</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {filteredEnquiries.map((enq) => {
                  const sourceConfig = SOURCE_LABELS[enq.source] || {
                    label: enq.source,
                    color: "bg-neutral-100 text-neutral-700 border-neutral-200",
                  };
                  const dateStr = new Date(enq.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  );

                  return (
                    <tr
                      key={enq.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="font-semibold text-neutral-900">
                          {enq.name}
                        </div>
                        <div className="flex flex-col gap-0.5 mt-0.5 text-xs text-neutral-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            {enq.phone}
                          </span>
                          {enq.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-neutral-400" />
                              {enq.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Interest & Budget */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold uppercase text-neutral-800">
                            {enq.interestedIn}
                          </span>
                          {enq.budgetLabel && (
                            <span className="text-xs text-neutral-600">
                              {enq.budgetLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Locality */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-700">
                        {enq.locality || "—"}
                      </td>

                      {/* Linked Property */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        {enq.property ? (
                          <Link
                            href={`/admin/rera/properties/${enq.property.id}/edit`}
                            className="text-xs font-medium text-neutral-900 hover:text-blue-600 line-clamp-1 underline decoration-neutral-300"
                            title={`Edit ${enq.property.title}`}
                          >
                            {enq.property.title}
                          </Link>
                        ) : (
                          <span className="text-xs text-neutral-400">General</span>
                        )}
                      </td>

                      {/* Source Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${sourceConfig.color}`}
                        >
                          {sourceConfig.label}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-500 font-mono">
                        {dateStr}
                      </td>

                      {/* Inline Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {updatingId === enq.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
                          ) : (
                            <select
                              value={enq.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  enq.id,
                                  e.target.value as LeadStatus
                                )
                              }
                              disabled={isPending}
                              className={`text-xs font-semibold rounded-md border px-2.5 py-1 focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                                STATUS_COLORS[enq.status]
                              }`}
                            >
                              <option value="NEW">New</option>
                              <option value="CONTACTED">Contacted</option>
                              <option value="CONVERTED">Converted</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* View Button */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/rera/enquiries/${enq.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

