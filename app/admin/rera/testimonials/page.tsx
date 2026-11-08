import Link from "next/link";
import { Plus, MessageSquare, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  TestimonialToggles,
  TestimonialActions,
} from "./_components/TestimonialTableClient";

export const dynamic = "force-dynamic";

export default async function AdminReraTestimonialsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const testimonials = await prisma.reraTestimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-neutral-800" /> RERA Testimonials
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage client reviews, homeowner recommendations, and ratings for the RERA sub-site.
          </p>
        </div>
        <Link
          href="/admin/rera/testimonials/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {testimonials.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-900">
              No testimonials yet
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Add genuine feedback and recommendations from happy home buyers and sellers.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/rera/testimonials/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Testimonial
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Quote</th>
                  <th className="py-3.5 px-4">Sort Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-4 min-w-[200px]">
                      <div className="font-semibold text-neutral-900">{t.authorName}</div>
                      {(t.authorRole || t.society) && (
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {[t.authorRole, t.society].filter(Boolean).join(" • ")}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= t.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-md">
                      <p className="text-xs text-neutral-600 line-clamp-2 italic">
                        &quot;{t.quote}&quot;
                      </p>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-neutral-600 font-mono text-xs">
                      {t.sortOrder}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <TestimonialToggles id={t.id} isPublished={t.isPublished} />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <TestimonialActions id={t.id} authorName={t.authorName} />
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

