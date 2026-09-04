"use client";

import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { updateLeadNotes } from "../actions";
import type { LeadData } from "./LeadTableClient";

export function LeadDetail({ lead, onClose, onNotesUpdated }: { lead: LeadData, onClose: () => void, onNotesUpdated: (id: string, notes: string) => void }) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await updateLeadNotes(lead.id, notes);
    onNotesUpdated(lead.id, notes);
    setIsSaving(false);
  };

  /** Format a single selection value into readable JSX */
  const formatValue = (key: string, value: unknown): React.ReactNode => {
    // Breakdown: [{label, amount}, ...]
    if (key === "breakdown" && Array.isArray(value)) {
      return (
        <ul className="mt-1 space-y-0.5">
          {(value as { label: string; amount: number }[]).map((item, i) => (
            <li key={i} className="flex justify-between text-xs">
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
      return list.length > 0 ? list.join(", ") : "—";
    }

    // Rooms / requirements: plain object → key: value pairs
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

    // Scalar
    return <span className="font-medium text-neutral-800">{String(value)}</span>;
  };

  const renderSelections = (selections: unknown) => {
    if (!selections) return null;

    try {
      const parsed: Record<string, unknown> =
        typeof selections === "string" ? JSON.parse(selections) : (selections as Record<string, unknown>);

      if (parsed.flowType === "commercial" || parsed.bhkType === "Commercial & Others") {
        const spaceDesc = String(parsed.description || parsed.spaceDescription || "");
        return (
          <div className="mt-4 p-4 bg-amber-50/50 rounded-md border border-amber-200">
            <h4 className="text-sm font-semibold text-amber-900 mb-3">
              Commercial Space Qualification Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-neutral-500 text-xs font-medium uppercase tracking-wide">Property Type</span>
                <span className="font-semibold text-neutral-900">{String(parsed.bhkType || "Commercial & Others")}</span>
              </div>
              {Boolean(parsed.businessType) && (
                <div>
                  <span className="block text-neutral-500 text-xs font-medium uppercase tracking-wide">Business / Space Type</span>
                  <span className="font-semibold text-neutral-900">{String(parsed.businessType)}</span>
                </div>
              )}
              {Boolean(parsed.approxAreaSqft) && (
                <div>
                  <span className="block text-neutral-500 text-xs font-medium uppercase tracking-wide">Approximate Area</span>
                  <span className="font-semibold text-neutral-900">{String(parsed.approxAreaSqft)} sq ft</span>
                </div>
              )}
              {Boolean(parsed.budgetRangeLabel) && (
                <div>
                  <span className="block text-neutral-500 text-xs font-medium uppercase tracking-wide">Rough Budget Range</span>
                  <span className="font-semibold text-neutral-900">{String(parsed.budgetRangeLabel)}</span>
                </div>
              )}
              {Boolean(spaceDesc) && (
                <div className="sm:col-span-2">
                  <span className="block text-neutral-500 text-xs font-medium uppercase tracking-wide mb-1">Description & Requirements</span>
                  <p className="text-neutral-800 bg-white p-3 rounded border border-neutral-200 text-xs sm:text-sm whitespace-pre-wrap">
                    {spaceDesc}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }

      // Compute total from breakdown if available
      const breakdown = parsed["breakdown"];
      const total =
        Array.isArray(breakdown)
          ? (breakdown as { amount: number }[]).reduce((sum, item) => sum + Number(item.amount), 0)
          : null;

      return (
        <div className="mt-4 p-4 bg-neutral-50 rounded-md border border-neutral-200">
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
                  {formatValue(key, value)}
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
    } catch {
      return <div className="text-sm text-red-500 mt-2">Error parsing selections data.</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Lead Details</h2>
            <p className="text-xs sm:text-sm text-neutral-500">Submitted on {new Date(lead.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <button onClick={onClose} className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-md hover:bg-neutral-200 text-neutral-500 transition-colors cursor-pointer" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Contact Information</h3>
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
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Requirements</h3>
                  <p className="text-sm text-neutral-800 bg-neutral-50 p-3 rounded-md border border-neutral-200 whitespace-pre-wrap">
                    {lead.requirements}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">System Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="block text-neutral-500 text-xs mb-1">Source</span>
                    <span className="inline-flex font-medium text-neutral-700 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded text-xs">
                      {lead.source.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-neutral-500 text-xs mb-1">Estimated Budget</span>
                    {lead.selections?.flowType === "commercial" || lead.selections?.bhkType === "Commercial & Others" ? (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block">
                        Custom quote — see details
                      </span>
                    ) : lead.estimatedBudget != null ? (
                      <span className="font-medium text-neutral-900">
                        ₹{lead.estimatedBudget.toLocaleString("en-IN")}
                      </span>
                    ) : lead.estimatedBudgetLow && lead.estimatedBudgetHigh ? (
                      <span className="font-medium text-neutral-900">
                        ₹{lead.estimatedBudgetLow.toLocaleString("en-IN")} - ₹{lead.estimatedBudgetHigh.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="font-medium text-neutral-500">—</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-neutral-500 text-xs mb-1">Current Status</span>
                    <span className="inline-flex font-medium text-neutral-900">{lead.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Internal Admin Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private notes about this lead..."
                  className="w-full h-32 p-3 text-base sm:text-sm rounded-md border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                >
                  <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          </div>

          {lead.source === "QUOTE_CALCULATOR" && lead.selections && (
            <div className="mt-8 pt-8 border-t border-neutral-200">
              {renderSelections(lead.selections)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}