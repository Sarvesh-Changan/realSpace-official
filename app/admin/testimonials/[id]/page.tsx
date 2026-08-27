import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { TestimonialFormClient } from "../_components/TestimonialFormClient";

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Testimonials
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Testimonial</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update client review for &quot;{testimonial.clientName}&quot;.
        </p>
      </div>

      <TestimonialFormClient
        mode="update"
        testimonialId={testimonial.id}
        initialData={{
          clientName: testimonial.clientName,
          clientRole: testimonial.clientRole || "",
          quote: testimonial.quote,
          imageUrl: testimonial.imageUrl || "",
          imagePublicId: testimonial.imagePublicId || "",
          videoUrl: testimonial.videoUrl || "",
          videoPublicId: testimonial.videoPublicId || "",
          thumbnailUrl: testimonial.thumbnailUrl || "",
          thumbnailPublicId: testimonial.thumbnailPublicId || "",
          slug: testimonial.slug || "",
          location: testimonial.location || "",
          projectType: testimonial.projectType || "",
          rating: testimonial.rating,
          sortOrder: testimonial.sortOrder,
          isPublished: testimonial.isPublished,
        }}
      />
    </div>
  );
}
