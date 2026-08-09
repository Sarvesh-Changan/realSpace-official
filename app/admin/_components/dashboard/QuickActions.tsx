"use client";

import Link from "next/link";
import { Plus, FolderOpen, Layers, MessageSquare, Settings, ArrowRight } from "lucide-react";

export function QuickActions() {
  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-4">
      <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
        <Plus className="w-4 h-4 text-brand-red" /> Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/projects/new"
          className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-red-50/70 border border-neutral-200 hover:border-red-200 rounded-md group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded border border-neutral-200 text-brand-red group-hover:scale-105 transition-transform">
              <FolderOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-neutral-800 group-hover:text-brand-red">
              Add Project
            </span>
          </div>
          <Plus className="w-4 h-4 text-neutral-400 group-hover:text-brand-red" />
        </Link>

        <Link
          href="/admin/services/new"
          className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-blue-50/70 border border-neutral-200 hover:border-blue-200 rounded-md group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded border border-neutral-200 text-blue-600 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-neutral-800 group-hover:text-blue-600">
              Add Service
            </span>
          </div>
          <Plus className="w-4 h-4 text-neutral-400 group-hover:text-blue-600" />
        </Link>

        <Link
          href="/admin/testimonials/new"
          className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-emerald-50/70 border border-neutral-200 hover:border-emerald-200 rounded-md group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded border border-neutral-200 text-emerald-600 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-neutral-800 group-hover:text-emerald-600">
              Add Testimonial
            </span>
          </div>
          <Plus className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600" />
        </Link>

        <Link
          href="/admin/settings"
          className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-md group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded border border-neutral-200 text-neutral-700 group-hover:scale-105 transition-transform">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-neutral-800 group-hover:text-neutral-900">
              Edit Settings
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700" />
        </Link>
      </div>
    </div>
  );
}
