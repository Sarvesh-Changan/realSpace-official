import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { FaqForm } from "../../_components/FaqForm";
import { updateFaq } from "../../actions";
import type { ReraFaqInput } from "../../schema";

export const dynamic = "force-dynamic";

export default async function EditReraFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const faq = await prisma.reraFaq.findUnique({
    where: { id },
  });

  if (!faq) {
    notFound();
  }

  const initialData: ReraFaqInput = {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    sortOrder: faq.sortOrder,
    isPublished: faq.isPublished,
  };

  const handleUpdate = async (data: ReraFaqInput) => {
    "use server";
    return updateFaq(id, data);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rera/faqs"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to FAQs
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Edit FAQ
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update question, response text, or publication status.
        </p>
      </div>

      <FaqForm initialData={initialData} onSubmitAction={handleUpdate} />
    </div>
  );
}

