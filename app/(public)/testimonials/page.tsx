import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { TestimonialsClient, type PublicVideoTestimonial } from "./TestimonialsClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";

  return constructMetadata({
    title: `Video Testimonials | ${companyName}`,
    description: `Watch video testimonials from REALSPACE clients about their interior and exterior design projects.`,
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
    videoUrl: true,
    videoPublicId: true,
    thumbnailUrl: true,
    createdAt: true,
  } as const;

  const [testimonials, directTestimonial] = await Promise.all([
    prisma.testimonial.findMany({
      where: {
        isPublished: true,
        videoUrl: { not: null },
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

  const items: PublicVideoTestimonial[] = allTestimonials.flatMap((testimonial) => {
    if (!testimonial.videoUrl) return [];

    return [{
      id: testimonial.id,
      title: testimonial.projectType || "A REALSPACE design story",
      clientName: testimonial.clientName,
      projectType: testimonial.projectType,
      location: testimonial.location,
      slug: testimonial.slug || testimonial.id,
      videoUrl: testimonial.videoUrl,
      videoPublicId: testimonial.videoPublicId,
      thumbnailUrl: testimonial.thumbnailUrl,
      createdAt: testimonial.createdAt.toISOString(),
    }];
  });

  return <TestimonialsClient testimonials={items} />;
}
