import prisma from "@/lib/prisma";
import { Hero } from "./_components/home/Hero";
import { TrustStats } from "./_components/home/TrustStats";
import { Positioning } from "./_components/home/Positioning";
import { Projects, type ProjectType } from "./_components/home/Projects";
import { Services } from "./_components/home/Services";
import { WhyChooseUs } from "./_components/home/WhyChooseUs";
import { Testimonials } from "./_components/home/Testimonials";
import { FinalCta } from "./_components/home/FinalCta";

export const revalidate = 60; // Revalidate static cache every 60 seconds

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function HomePage() {
  let siteSettings = null;
  let rawInteriorProjects: Array<{
    id: string;
    slug: string;
    title: string;
    location: string;
    category: string;
    images: Array<{ url: string }>;
  }> = [];
  let rawExteriorProjects: Array<{
    id: string;
    slug: string;
    title: string;
    location: string;
    category: string;
    images: Array<{ url: string }>;
  }> = [];
  let services: Array<{
    id: string;
    title: string;
    description: string;
    iconKey?: string | null;
  }> = [];
  let testimonials: Array<{
    id: string;
    quote: string;
    clientName: string;
    clientRole?: string | null;
    rating?: number;
  }> = [];

  try {
    // Fetch all home page data safely
    const [
      fetchedSettings,
      fetchedInterior,
      fetchedExterior,
      fetchedServices,
      fetchedTestimonials,
    ] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
      prisma.project.findMany({
        where: {
          designType: "INTERIOR",
          isFeatured: true,
          isPublished: true,
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
        orderBy: { sortOrder: "asc" },
        take: 3,
      }),
      prisma.project.findMany({
        where: {
          designType: "EXTERIOR",
          isFeatured: true,
          isPublished: true,
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
        orderBy: { sortOrder: "asc" },
        take: 3,
      }),
      prisma.service.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
        take: 6,
      }),
      prisma.testimonial.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
        take: 3,
      }),
    ]);

    siteSettings = fetchedSettings;
    rawInteriorProjects = fetchedInterior;
    rawExteriorProjects = fetchedExterior;
    services = fetchedServices;
    testimonials = fetchedTestimonials;
  } catch (error) {
    console.error("Error loading home page data from Prisma:", error);
    // Graceful fallback: empty states will be rendered by subcomponents
  }

  // Map database project models to ProjectType props for subcomponents
  const interiorProjects: ProjectType[] = rawInteriorProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    location: p.location,
    category: formatCategory(p.category),
    imageUrl:
      p.images[0]?.url ||
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
  }));

  const exteriorProjects: ProjectType[] = rawExteriorProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    location: p.location,
    category: formatCategory(p.category),
    imageUrl:
      p.images[0]?.url ||
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  }));

  return (
    <>
      <Hero
        heroHeadline={siteSettings?.heroHeadline}
        heroSubhead={siteSettings?.heroSubhead}
        ctaText={siteSettings?.ctaText}
      />
      <TrustStats />
      <Positioning />
      <Projects
        title="Selected Interior Projects"
        subtitle="Explore our curated portfolio of bespoke interior transformations."
        projects={interiorProjects}
        viewAllLink="/projects?type=interior"
      />
      <Projects
        title="Selected Exterior Projects"
        subtitle="Discover our striking architectural facades and outdoor spaces."
        projects={exteriorProjects}
        viewAllLink="/projects?type=exterior"
      />
      <Services services={services} />
      <WhyChooseUs />
      <Testimonials testimonials={testimonials} />
      <FinalCta ctaText={siteSettings?.ctaText} />
    </>
  );
}
