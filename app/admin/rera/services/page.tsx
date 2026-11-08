import Link from "next/link";
import { Plus, Briefcase, Building2, Sparkles, ShieldCheck, Calculator, KeyRound } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ServiceToggles, ServiceActions } from "./_components/ServiceTableClient";

export const dynamic = "force-dynamic";

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  building2: Building2,
  sparkles: Sparkles,
  briefcase: Briefcase,
  shieldcheck: ShieldCheck,
  calculator: Calculator,
  keyround: KeyRound,
};

export default async function AdminReraServicesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const services = await prisma.reraService.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-neutral-800" /> RERA Services
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage real estate services, advisory offerings, and highlights on the RERA website.
          </p>
        </div>
        <Link
          href="/admin/rera/services/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Service
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {services.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-900">
              No services added yet
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Add services such as Property Buying Advisory, Home Loans, Legal Verification, or NRI Desk.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/rera/services/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Service
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Highlights</th>
                  <th className="py-3.5 px-4">Sort Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {services.map((srv) => {
                  const Icon = ICON_COMPONENTS[srv.iconKey?.toLowerCase() || "building2"] || Building2;

                  return (
                    <tr key={srv.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4 px-4 min-w-[220px]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0 mt-0.5">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">{srv.title}</div>
                            <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                              {srv.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {srv.highlights.length > 0 ? (
                            srv.highlights.map((h, i) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-700 text-xs rounded border border-neutral-200"
                              >
                                {h}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-neutral-400">None</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-neutral-600 font-mono text-xs">
                        {srv.sortOrder}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <ServiceToggles id={srv.id} isPublished={srv.isPublished} />
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <ServiceActions id={srv.id} title={srv.title} />
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
