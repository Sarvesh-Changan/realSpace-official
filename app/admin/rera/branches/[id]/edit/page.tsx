import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { BranchForm } from "../../_components/BranchForm";
import { updateBranch } from "../../actions";
import type { ReraBranchInput } from "../../schema";

export const dynamic = "force-dynamic";

export default async function EditReraBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const branch = await prisma.reraBranch.findUnique({
    where: { id },
  });

  if (!branch) {
    notFound();
  }

  const initialData: ReraBranchInput = {
    id: branch.id,
    name: branch.name,
    address: branch.address,
    phone: branch.phone ?? "",
    mapUrl: branch.mapUrl ?? "",
    sortOrder: branch.sortOrder,
    isPublished: branch.isPublished,
  };

  const handleUpdate = async (data: ReraBranchInput) => {
    "use server";
    return updateBranch(id, data);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rera/branches"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Branches
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Edit Branch: {branch.name}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update branch address, phone number, Google Maps link, or status.
        </p>
      </div>

      <BranchForm initialData={initialData} onSubmitAction={handleUpdate} />
    </div>
  );
}

