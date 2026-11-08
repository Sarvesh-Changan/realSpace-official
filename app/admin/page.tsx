import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { DashboardOverview } from "./_components/DashboardOverview";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // 1. Re-check admin session server-side per SECURITY.md §1
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  // 2. Fetch real analytics metrics, recent leads, and RERA enquiries from Prisma
  const [
    totalProjects,
    publishedProjects,
    totalTestimonials,
    newLeadsCount,
    totalLeadsCount,
    recentLeadsRaw,
    newReraEnquiriesCount,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { isPublished: true } }),
    prisma.testimonial.count({ where: { isPublished: true } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.reraEnquiry.count({ where: { status: "NEW" } }),
  ]);

  const stats = {
    totalProjects,
    publishedProjects,
    totalTestimonials,
    newLeadsCount,
    totalLeadsCount,
  };

  const recentLeads = recentLeadsRaw.map((lead) => ({
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    location: lead.location,
    source: lead.source,
    status: lead.status,
    createdAt: lead.createdAt,
  }));

  return (
    <div className="space-y-6">
      {/* New RERA enquiries count card */}
      <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neutral-900 text-white rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              RERA Realty Sub-site
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-neutral-900">
                {newReraEnquiriesCount}
              </span>
              <span className="text-xs font-medium text-neutral-500">
                New RERA {newReraEnquiriesCount === 1 ? "enquiry" : "enquiries"}
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/admin/rera/enquiries"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 transition-colors w-fit self-start sm:self-auto"
        >
          View RERA Enquiries <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <DashboardOverview stats={stats} recentLeads={recentLeads} />
    </div>
  );
}
