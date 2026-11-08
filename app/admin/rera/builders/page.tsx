import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Construction } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReraBuildersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Builder Partners</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage builder partner profiles shown on the RERA sub-site.
        </p>
      </div>
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <Construction className="w-10 h-10 text-neutral-300 mb-4" />
        <h2 className="text-lg font-semibold text-neutral-700 mb-1">Coming Soon</h2>
        <p className="text-sm text-neutral-500 max-w-md">
          The Builder Partners module is being built and will be available here shortly.
        </p>
      </div>
    </div>
  );
}

