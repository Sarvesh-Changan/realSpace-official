import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FaqForm } from "../_components/FaqForm";
import { createFaq } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewReraFaqPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rera/faqs"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to FAQs
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Add New FAQ</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Add an answer to help property buyers make confident decisions.
        </p>
      </div>

      <FaqForm onSubmitAction={createFaq} />
    </div>
  );
}

