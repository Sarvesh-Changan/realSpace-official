import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { TestimonialsClient, type PublicVideoTestimonial } from "./TestimonialsClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";

  return constructMetadata({
    title: `Client Testimonials | ${companyName}`,
    description: `Read and watch testimonials from REALSPACE clients about their interior and exterior design projects.`,
    path: "/testimonials",
  });
}

interface TestimonialsPageProps {
  searchParams: Promise<{ video?: string | string[] }>;
}

export default async function TestimonialsPage({ searchParams }: TestimonialsPageProps) {
  const params = await searchParams;
  const videoSlug = Array.isArray(params.video) ? params.video[0] : params.video;
  const testimonialSelect = {
    id: true,
    isPublished: true,
    clientName: true,
    projectType: true,
    location: true,
    slug: true,
    quote: true,
    videoUrl: true,
    videoPublicId: true,
    imageUrl: true,
    thumbnailUrl: true,
    rating: true,
    createdAt: true,
  } as const;

  const [testimonials, directTestimonial] = await Promise.all([
    prisma.testimonial.findMany({
      where: {
        isPublished: true,
      },
      select: testimonialSelect,
      orderBy: { createdAt: "desc" },
    }),
    videoSlug
      ? prisma.testimonial.findUnique({
          where: { slug: videoSlug },
          select: testimonialSelect,
        })
      : Promise.resolve(null),
  ]);

  const allTestimonials = directTestimonial &&
    directTestimonial.videoUrl &&
    directTestimonial.isPublished &&
    !testimonials.some((testimonial) => testimonial.id === directTestimonial.id)
    ? [directTestimonial, ...testimonials]
    : testimonials;

  const items: PublicVideoTestimonial[] = allTestimonials.map((testimonial) => ({
      id: testimonial.id,
      title: testimonial.projectType || "A REALSPACE design story",
      clientName: testimonial.clientName,
      projectType: testimonial.projectType,
      location: testimonial.location,
      slug: testimonial.slug || testimonial.id,
      quote: testimonial.quote,
      videoUrl: testimonial.videoUrl,
      videoPublicId: testimonial.videoPublicId,
      imageUrl: testimonial.imageUrl,
      thumbnailUrl: testimonial.thumbnailUrl,
      rating: testimonial.rating,
      createdAt: testimonial.createdAt.toISOString(),
    }));

  return <TestimonialsClient testimonials={items} />;
}
