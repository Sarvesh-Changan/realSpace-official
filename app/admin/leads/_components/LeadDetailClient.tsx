"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Calculator, Mail, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateLeadStatus, updateLeadNotes } from "../actions";
import type { LeadSource, LeadStatus } from "@prisma/client";

export type LeadDetailData = {
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

export function LeadDetailClient({ lead }: { lead: LeadDetailData }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes || "");
  const [isUpdatingStatus, startStatusTransition] = useTransition();
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setStatus(newStatus);
    setFeedback(null);

    startStatusTransition(async () => {
      const res = await updateLeadStatus(lead.id, newStatus);
      if (!res.success) {
        setFeedback({ type: "error", message: res.error || "Failed to update status." });
      } else {
        setFeedback({ type: "success", message: "Lead status updated successfully." });
      }
    });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setFeedback(null);

    try {
      const res = await updateLeadNotes(lead.id, notes);
      if (!res.success) {
        setFeedback({ type: "error", message: res.error || "Failed to save notes." });
      } else {
        setFeedback({ type: "success", message: "Notes saved successfully." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "An error occurred while saving notes." });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getSourceIcon = (src: string) => {
    switch (src) {
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

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumSignificantDigits: 3,
    }).format(amount);
  };

  const formatSelectionValue = (key: string, value: unknown): React.ReactNode => {
    // Breakdown: [{label, amount}, ...]
    if (key === "breakdown" && Array.isArray(value)) {
      return (
        <ul className="mt-1 space-y-0.5 w-full">
          {(value as { label: string; amount: number }[]).map((item, i) => (
            <li key={i} className="flex justify-between text-xs py-0.5 border-b border-neutral-100 last:border-0">
              <span className="text-neutral-700">{item.label}</span>
              <span className="font-semibold text-neutral-900">
                ₹{Number(item.amount).toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    // Additional services: string[]
    if (key === "additionalServices" && Array.isArray(value)) {
      const list = value as string[];
      return (
        <span className="font-medium text-neutral-800">
          {list.length > 0 ? list.join(", ") : "—"}
        </span>
      );
    }

    // Rooms / requirements: plain object → inline chips
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const entries = Object.entries(value as Record<string, unknown>);
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          {entries.map(([k, v]) => (
            <span key={k} className="text-xs">
              <span className="capitalize text-neutral-500">{k}: </span>
              <span className="font-medium text-neutral-800">
                {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}
              </span>
            </span>
          ))}
        </div>
      );
    }

    // Scalar (string / number)
    return <span className="font-medium text-neutral-800">{String(value)}</span>;
  };

  const renderSelections = (selections: unknown) => {
    if (!selections) return null;

    try {
      const parsed: Record<string, unknown> =
        typeof selections === "string"
          ? JSON.parse(selections)
          : (selections as Record<string, unknown>);

      if (parsed.flowType === "commercial" || parsed.bhkType === "Commercial & Others") {
        const spaceDesc = String(parsed.description || parsed.spaceDescription || "");
        return (
          <div className="p-4 bg-amber-50/50 rounded-md border border-amber-200">
            <h4 className="text-sm font-semibold text-amber-900 mb-4">
              Commercial Space Qualification Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex flex-col py-2 border-b border-amber-200/60">
                <span className="text-neutral-500 text-xs font-medium uppercase tracking-wide mb-1">
                  Property Type
                </span>
                <span className="font-semibold text-neutral-900">{String(parsed.bhkType || "Commercial & Others")}</span>
              </div>
              {Boolean(parsed.businessType) && (
                <div className="flex flex-col py-2 border-b border-amber-200/60">
                  <span className="text-neutral-500 text-xs font-medium uppercase tracking-wide mb-1">
                    Business / Space Type
                  </span>
                  <span className="font-semibold text-neutral-900">{String(parsed.businessType)}</span>
                </div>
              )}
              {Boolean(parsed.approxAreaSqft) && (
                <div className="flex flex-col py-2 border-b border-amber-200/60">
                  <span className="text-neutral-500 text-xs font-medium uppercase tracking-wide mb-1">
                    Approximate Area
                  </span>
                  <span className="font-semibold text-neutral-900">{String(parsed.approxAreaSqft)} sq ft</span>
                </div>
              )}
              {Boolean(parsed.budgetRangeLabel) && (
                <div className="flex flex-col py-2 border-b border-amber-200/60">
                  <span className="text-neutral-500 text-xs font-medium uppercase tracking-wide mb-1">
                    Rough Budget Range
                  </span>
                  <span className="font-semibold text-neutral-900">{String(parsed.budgetRangeLabel)}</span>
                </div>
              )}
              {Boolean(spaceDesc) && (
                <div className="sm:col-span-2 flex flex-col py-2">
                  <span className="text-neutral-500 text-xs font-medium uppercase tracking-wide mb-1">
                    Description & Requirements
                  </span>
                  <p className="text-neutral-800 bg-white p-3 rounded border border-neutral-200 text-sm whitespace-pre-wrap">
                    {spaceDesc}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }

      // Compute total from breakdown
      const breakdown = parsed["breakdown"];
      const total = Array.isArray(breakdown)
        ? (breakdown as { amount: number }[]).reduce((sum, item) => sum + Number(item.amount), 0)
        : null;

      return (
        <div className="p-4 bg-neutral-50 rounded-md border border-neutral-200">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">Quote Calculator Selections</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {Object.entries(parsed).map(([key, value]) => {
              const label = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase());
              return (
                <div
                  key={key}
                  className={`flex flex-col py-2 border-b border-neutral-200 last:border-0 ${
                    key === "breakdown" ? "sm:col-span-2" : ""
                  }`}
                >
                  <span className="text-neutral-400 text-xs font-medium uppercase tracking-wide mb-1">
                    {label}
                  </span>
                  {formatSelectionValue(key, value)}
                </div>
              );
            })}
          </div>

          {total !== null && (
            <div className="mt-4 pt-3 border-t border-neutral-300 flex justify-between items-center">
              <span className="text-sm font-semibold text-neutral-700">Estimated Total</span>
              <span className="text-base font-bold text-red-600">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      );
    } catch (e) {
      console.error(e);
      return <div className="text-sm text-red-500 mt-2">Error parsing selections data.</div>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/admin/leads"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Leads
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{lead.name}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Submitted on {new Date(lead.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status:</label>
            <select
              disabled={isUpdatingStatus}
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              className={`text-sm font-medium rounded border px-3 py-1.5 outline-none transition-colors ${
                status === "NEW"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : status === "CONTACTED"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : status === "CONVERTED"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-neutral-100 text-neutral-600 border-neutral-200"
              }`}
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONVERTED">Converted</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md flex items-center gap-3 text-sm border ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="block text-neutral-500 text-xs">Name</span>
                  <span className="font-medium text-neutral-900">{lead.name}</span>
                </div>
                <div>
                  <span className="block text-neutral-500 text-xs">Phone</span>
                  <span className="font-medium text-neutral-900">{lead.phone}</span>
                </div>
                {lead.email && (
                  <div>
                    <span className="block text-neutral-500 text-xs">Email</span>
                    <span className="font-medium text-neutral-900">{lead.email}</span>
                  </div>
                )}
                {lead.location && (
                  <div>
                    <span className="block text-neutral-500 text-xs">Location</span>
                    <span className="font-medium text-neutral-900">{lead.location}</span>
                  </div>
                )}
              </div>
            </div>

            {lead.requirements && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Requirements
                </h3>
                <p className="text-sm text-neutral-800 bg-neutral-50 p-3 rounded-md border border-neutral-200 whitespace-pre-wrap">
                  {lead.requirements}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                System Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="block text-neutral-500 text-xs mb-1">Source</span>
                  <div className="flex items-center gap-2">
                    {getSourceIcon(lead.source)}
                    <span className="inline-flex font-medium text-neutral-700 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded text-xs">
                      {lead.source.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-neutral-500 text-xs mb-1">Estimated Budget</span>
                  <span className="font-medium text-neutral-900">
                    {lead.selections?.flowType === "commercial" || lead.selections?.bhkType === "Commercial & Others" ? (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block">
                        Custom quote — see details
                      </span>
                    ) : lead.estimatedBudget != null ? (
                      formatCurrency(lead.estimatedBudget)
                    ) : lead.estimatedBudgetLow || lead.estimatedBudgetHigh ? (
                      `${formatCurrency(lead.estimatedBudgetLow)} - ${formatCurrency(lead.estimatedBudgetHigh)}`
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Internal Admin Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private notes about this lead..."
                className="w-full h-32 p-3 text-sm rounded-md border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isSavingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>

        {lead.source === "QUOTE_CALCULATOR" && lead.selections && (
          <div className="pt-6 border-t border-neutral-200">
            {renderSelections(lead.selections)}
          </div>
        )}
      </div>
    </div>
  );
}
