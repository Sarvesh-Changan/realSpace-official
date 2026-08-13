import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OfferForm } from "../_components/OfferForm";

export default async function NewOfferPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/offers"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Offers
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Add New Offer</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Create a new promotional offer or discount banner.
        </p>
      </div>

      <OfferForm mode="create" />
    </div>
  );
}
