import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LeadTableClient } from "./_components/LeadTableClient";

export default async function AdminLeadsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Leads</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage inquiries and quote calculator submissions.
          </p>
        </div>
      </div>

      <LeadTableClient leads={leads} />
    </div>
  );
}

