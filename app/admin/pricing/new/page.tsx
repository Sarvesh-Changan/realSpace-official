import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PricingOptionFormClient } from "../_components/PricingOptionFormClient";

interface NewPricingOptionPageProps {
  searchParams: Promise<{ groupKey?: string }>;
}

export default async function NewPricingOptionPage({ searchParams }: NewPricingOptionPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { groupKey } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pricing"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pricing Rules
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Add Pricing Option</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure a new selectable option or base price rule for the public quote calculator.
        </p>
      </div>

      <PricingOptionFormClient
        mode="create"
        initialData={{
          groupKey: groupKey || "",
        }}
      />
    </div>
  );
}
