import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardOverview } from "./_components/DashboardOverview";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // 1. Re-check admin session server-side per SECURITY.md §1
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  // 2. Fetch real analytics metrics and recent leads from Prisma
  const [
    totalProjects,
    publishedProjects,
    totalServices,
    totalTestimonials,
    newLeadsCount,
    totalLeadsCount,
    recentLeadsRaw,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { isPublished: true } }),
    prisma.service.count({ where: { isPublished: true } }),
    prisma.testimonial.count({ where: { isPublished: true } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = {
    totalProjects,
    publishedProjects,
    totalServices,
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

  return <DashboardOverview stats={stats} recentLeads={recentLeads} />;
}
