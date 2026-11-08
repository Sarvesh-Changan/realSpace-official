import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ServiceForm } from "../_components/ServiceForm";
import { createService } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewReraServicePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rera/services"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Services
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Add New Service</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Create a new real estate advisory or property service for the RERA website.
        </p>
      </div>

      <ServiceForm onSubmitAction={createService} />
    </div>
  );
}

