"use client";

import Link from "next/link";
import { Clock, Users, ArrowRight } from "lucide-react";

export interface DashboardLead {
  id: string;
  name: string;
  phone: string;
  location?: string | null;
  source: string;
  status: "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED" | string;
  createdAt: string | Date;
}

function formatSource(source: string): string {
  switch (source) {
    case "QUOTE_CALCULATOR":
      return "Quote Calculator";
    case "CONTACT_FORM":
      return "Contact Form";
    case "WHATSAPP_CLICK":
      return "WhatsApp";
    default:
      return source.replace(/_/g, " ");
  }
}

function getSourceBadgeClass(source: string): string {
  switch (source) {
    case "QUOTE_CALCULATOR":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "CONTACT_FORM":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "WHATSAPP_CLICK":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "NEW":
      return "bg-red-50 text-brand-red border-red-200 font-bold animate-pulse";
    case "CONTACTED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CONVERTED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CLOSED":
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
  }
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentLeadsTable({
  recentLeads,
  totalLeadsCount,
}: {
  recentLeads: DashboardLead[];
  totalLeadsCount: number;
}) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
        <div>
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-red" /> Recent Lead Inquiries
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            5 most recent quote submissions & contact requests
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="inline-flex items-center text-xs font-bold text-brand-red hover:text-brand-red/80 transition-colors gap-1"
        >
          View All Leads ({totalLeadsCount}) <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentLeads.length === 0 ? (
        <div className="p-8 text-center text-neutral-500">
          <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-medium">No lead submissions recorded yet.</p>
          <p className="text-xs text-neutral-400 mt-1">
            Submissions from the quote calculator and contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">Lead Name</th>
                <th className="py-3 px-4">Phone / Location</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-neutral-900">
                    {lead.name}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="text-neutral-800 font-mono">{lead.phone}</div>
                    <div className="text-neutral-400">{lead.location || "—"}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSourceBadgeClass(
                        lead.source
                      )}`}
                    >
                      {formatSource(lead.source)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadgeClass(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-neutral-500">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="inline-flex items-center text-xs font-medium text-neutral-700 hover:text-brand-red bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded transition-colors"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
