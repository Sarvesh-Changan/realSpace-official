"use client";

import Link from "next/link";
import {
  FolderOpen,
  Layers,
  MessageSquare,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalServices: number;
  totalTestimonials: number;
  newLeadsCount: number;
  totalLeadsCount: number;
}

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: New Leads (Actionable / Highlighted) */}
      <div
        className={`p-5 rounded-lg border transition-all shadow-sm relative overflow-hidden ${
          stats.newLeadsCount > 0
            ? "bg-gradient-to-br from-red-50 to-white border-red-200 ring-2 ring-red-500/20"
            : "bg-white border-neutral-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Actionable Leads
          </span>
          <div className="p-2 bg-red-100 rounded-md text-brand-red">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-neutral-900">
            {stats.newLeadsCount}
          </span>
          <span className="text-xs font-medium text-neutral-500">
            NEW inquiries
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-neutral-100">
          <span className="text-neutral-500">
            Total received: <strong className="text-neutral-800">{stats.totalLeadsCount}</strong>
          </span>
          {stats.newLeadsCount > 0 ? (
            <span className="inline-flex items-center text-brand-red font-semibold gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Action Required
            </span>
          ) : (
            <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All caught up
            </span>
          )}
        </div>
      </div>

      {/* Card 2: Projects */}
      <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Published Projects
          </span>
          <div className="p-2 bg-amber-50 rounded-md text-brand-yellow">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-neutral-900">
            {stats.publishedProjects}
          </span>
          <span className="text-xs font-medium text-neutral-500">
            of {stats.totalProjects} total
          </span>
        </div>
        <div className="mt-3 text-xs text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span>Portfolio Showcase</span>
          <Link
            href="/admin/projects"
            className="text-neutral-700 font-medium hover:text-brand-red transition-colors inline-flex items-center gap-0.5"
          >
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Card 3: Services */}
      <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Active Services
          </span>
          <div className="p-2 bg-blue-50 rounded-md text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-neutral-900">
            {stats.totalServices}
          </span>
          <span className="text-xs font-medium text-neutral-500">
            Interior & Exterior
          </span>
        </div>
        <div className="mt-3 text-xs text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span>Service Catalog</span>
          <Link
            href="/admin/services"
            className="text-neutral-700 font-medium hover:text-brand-red transition-colors inline-flex items-center gap-0.5"
          >
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Card 4: Testimonials */}
      <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Client Testimonials
          </span>
          <div className="p-2 bg-emerald-50 rounded-md text-emerald-600">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-neutral-900">
            {stats.totalTestimonials}
          </span>
          <span className="text-xs font-medium text-neutral-500">
            Verified Reviews
          </span>
        </div>
        <div className="mt-3 text-xs text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span>Social Proof</span>
          <Link
            href="/admin/testimonials"
            className="text-neutral-700 font-medium hover:text-brand-red transition-colors inline-flex items-center gap-0.5"
          >
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
