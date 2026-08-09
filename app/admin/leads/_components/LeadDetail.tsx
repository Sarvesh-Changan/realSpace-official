"use client";

import { useState } from "react";
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

  const renderSelections = (selections: any) => {
    if (!selections) return null;

    try {
      const parsed = typeof selections === 'string' ? JSON.parse(selections) : selections;
      
      return (
        <div className="mt-4 p-4 bg-neutral-50 rounded-md border border-neutral-200">
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">Quote Calculator Selections</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {Object.entries(parsed).map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              let displayValue = String(value);
              
              if (typeof value === 'object' && value !== null) {
                displayValue = JSON.stringify(value);
              }

              return (
                <div key={key} className="flex flex-col py-1 border-b border-neutral-100 last:border-0">
                  <span className="text-neutral-500 text-xs">{label}</span>
                  <span className="font-medium text-neutral-800">{displayValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    } catch (e) {
      return <div className="text-sm text-red-500 mt-2">Error parsing selections data.</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Lead Details</h2>
            <p className="text-sm text-neutral-500">Submitted on {new Date(lead.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-neutral-200 text-neutral-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
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
                  className="w-full h-32 p-3 text-sm rounded-md border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50"
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