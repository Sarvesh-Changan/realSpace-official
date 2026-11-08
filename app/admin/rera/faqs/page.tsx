import Link from "next/link";
import { Plus, HelpCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FaqToggles, FaqActions } from "./_components/FaqTableClient";

export const dynamic = "force-dynamic";

export default async function AdminReraFaqsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const faqs = await prisma.reraFaq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-neutral-800" /> RERA FAQs
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage frequently asked questions on property buying, home loans, MahaRERA compliance, and documentation.
          </p>
        </div>
        <Link
          href="/admin/rera/faqs/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {faqs.length === 0 ? (
          <div className="text-center py-12 px-4">
            <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-900">
              No FAQs added yet
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Add answers to common buyer questions regarding RERA, down payments, registration, and site visits.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/rera/faqs/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add FAQ
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Question</th>
                  <th className="py-3.5 px-4">Answer Preview</th>
                  <th className="py-3.5 px-4">Sort Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-4 min-w-[240px]">
                      <div className="font-semibold text-neutral-900">{faq.question}</div>
                    </td>

                    <td className="py-4 px-4 max-w-md">
                      <p className="text-xs text-neutral-600 line-clamp-2">
                        {faq.answer}
                      </p>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-neutral-600 font-mono text-xs">
                      {faq.sortOrder}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <FaqToggles id={faq.id} isPublished={faq.isPublished} />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <FaqActions id={faq.id} question={faq.question} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

