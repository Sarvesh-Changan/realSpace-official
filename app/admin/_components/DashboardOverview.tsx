"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatCards, type DashboardStats } from "./dashboard/StatCards";
import { QuickActions } from "./dashboard/QuickActions";
import { RecentLeadsTable, type DashboardLead } from "./dashboard/RecentLeadsTable";

export type { DashboardStats, DashboardLead };

export interface DashboardOverviewProps {
  stats: DashboardStats;
  recentLeads: DashboardLead[];
}

export function DashboardOverview({ stats, recentLeads }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Studio Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Overview of REALSPACE portfolio performance, content stats, and lead pipeline.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors w-fit"
        >
          View Live Website <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Cards Row */}
      <StatCards stats={stats} />

      {/* Quick Actions Section */}
      <QuickActions />

      {/* Recent Leads Table */}
      <RecentLeadsTable recentLeads={recentLeads} totalLeadsCount={stats.totalLeadsCount} />
    </div>
  );
}
