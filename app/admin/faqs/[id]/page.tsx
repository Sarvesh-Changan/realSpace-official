import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { FaqForm } from "../_components/FaqForm";

interface EditFaqPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const faq = await prisma.fAQ.findUnique({
    where: { id },
  });

  if (!faq) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/faqs"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to FAQs
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Edit FAQ</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update existing question and answer pair.
        </p>
      </div>

      <FaqForm
        mode="update"
        faqId={faq.id}
        initialData={{
          question: faq.question,
          answer: faq.answer,
          sortOrder: faq.sortOrder,
          isPublished: faq.isPublished,
        }}
      />
    </div>
  );
}
