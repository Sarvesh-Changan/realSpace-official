import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { TestimonialForm } from "../../_components/TestimonialForm";
import { updateTestimonial } from "../../actions";
import type { ReraTestimonialInput } from "../../schema";

export const dynamic = "force-dynamic";

export default async function EditReraTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const testimonial = await prisma.reraTestimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    notFound();
  }

  const initialData: ReraTestimonialInput = {
    id: testimonial.id,
    authorName: testimonial.authorName,
    authorRole: testimonial.authorRole ?? "",
    society: testimonial.society ?? "",
    quote: testimonial.quote,
    rating: testimonial.rating,
    sortOrder: testimonial.sortOrder,
    isPublished: testimonial.isPublished,
  };

  const handleUpdate = async (data: ReraTestimonialInput) => {
    "use server";
    return updateTestimonial(id, data);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rera/testimonials"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Testimonials
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Edit Testimonial: {testimonial.authorName}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update review content, society details, rating, or publication status.
        </p>
      </div>

      <TestimonialForm initialData={initialData} onSubmitAction={handleUpdate} />
    </div>
  );
}

