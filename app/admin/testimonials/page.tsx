import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TestimonialTableWrapper } from "./_components/TestimonialTableClient";

export default async function AdminTestimonialsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <TestimonialTableWrapper testimonials={testimonials} />
    </div>
  );
}

