import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PricingOptionFormClient } from "../_components/PricingOptionFormClient";

interface EditPricingOptionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPricingOptionPage({ params }: EditPricingOptionPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const option = await prisma.pricingOption.findUnique({
    where: { id },
  });

  if (!option) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pricing"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pricing Rules
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Pricing Option</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update price rule and configurations for &quot;{option.label}&quot;.
        </p>
      </div>

      <PricingOptionFormClient
        mode="update"
        optionId={option.id}
        initialData={{
          groupKey: option.groupKey,
          label: option.label,
          designType: option.designType || null,
          basePrice: Number(option.basePrice),
          perUnitPrice: option.perUnitPrice ? Number(option.perUnitPrice) : null,
          isActive: option.isActive,
          sortOrder: option.sortOrder,
        }}
      />
    </div>
  );
}
