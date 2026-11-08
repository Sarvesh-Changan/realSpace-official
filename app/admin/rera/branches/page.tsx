import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  BranchToggles,
  BranchActions,
} from "./_components/BranchTableClient";

export const dynamic = "force-dynamic";

export default async function AdminReraBranchesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const branches = await prisma.reraBranch.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-neutral-800" /> Branch Offices
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage physical office locations and service centers shown on the RERA website.
          </p>
        </div>
        <Link
          href="/admin/rera/branches/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {branches.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-900">
              No branch offices added yet
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Add your branch locations in Thane (Majiwada, Ghodbunder Road, Vartak Nagar, etc.).
            </p>
            <div className="mt-6">
              <Link
                href="/admin/rera/branches/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Branch
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Branch Name</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Sort Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-4 min-w-[180px]">
                      <div className="font-semibold text-neutral-900">{b.name}</div>
                    </td>

                    <td className="py-4 px-4 max-w-xs text-xs text-neutral-600">
                      {b.address}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-700 font-mono">
                      {b.phone || "—"}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-neutral-600 font-mono text-xs">
                      {b.sortOrder}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <BranchToggles id={b.id} isPublished={b.isPublished} />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <BranchActions id={b.id} name={b.name} mapUrl={b.mapUrl} />
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

