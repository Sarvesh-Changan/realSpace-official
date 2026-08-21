import prisma from "@/lib/prisma";
import { Hero } from "./_components/home/Hero";
import { ActiveOffers, type OfferType } from "./_components/home/ActiveOffers";
import { TrustStats } from "./_components/home/TrustStats";
import { Positioning } from "./_components/home/Positioning";
import { Projects, type ProjectType } from "./_components/home/Projects";
import { Services } from "./_components/home/Services";
import { GalleryTeaser, type GalleryTeaserItem } from "./_components/home/GalleryTeaser";
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
  let rawOffers: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    ctaLabel: string;
    ctaLink: string;
  }> = [];
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
  let rawGalleryImages: Array<{
    id: string;
    title: string;
    url: string;
    category: { name: string } | null;
  }> = [];

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch all home page data safely
    const [
      fetchedSettings,
      fetchedOffers,
      fetchedInterior,
      fetchedExterior,
      fetchedServices,
      fetchedTestimonials,
      fetchedGalleryImages,
    ] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
      prisma.offer.findMany({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: endOfToday } }] },
            { OR: [{ endDate: null }, { endDate: { gte: startOfToday } }] },
          ],
        },
        orderBy: { sortOrder: "asc" },
      }),
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
      prisma.galleryImage.findMany({
        where: { isPublished: true },
        include: { category: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 8,
      }),
    ]);

    siteSettings = fetchedSettings;
    rawOffers = fetchedOffers;
    rawInteriorProjects = fetchedInterior;
    rawExteriorProjects = fetchedExterior;
    services = fetchedServices;
    testimonials = fetchedTestimonials;
    rawGalleryImages = fetchedGalleryImages;
  } catch (error) {
    console.error("Error loading home page data from Prisma:", error);
    // Graceful fallback: empty states will be rendered by subcomponents
  }

  // Map database offer models to OfferType props for subcomponent
  const offers: OfferType[] = rawOffers.map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    imageUrl: o.imageUrl,
    ctaLabel: o.ctaLabel,
    ctaLink: o.ctaLink,
  }));

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

  // Map database gallery image models to GalleryTeaserItem props
  const galleryTeaserItems: GalleryTeaserItem[] = rawGalleryImages.map((img) => ({
    id: img.id,
    title: img.title,
    category: img.category?.name || "Gallery",
    imageUrl: img.url,
  }));

  return (
    <>
      <Hero
        heroHeadline={siteSettings?.heroHeadline}
        heroSubhead={siteSettings?.heroSubhead}
        ctaText={siteSettings?.ctaText}
      />
      <ActiveOffers offers={offers} />
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
      <GalleryTeaser items={galleryTeaserItems} />
      <Testimonials testimonials={testimonials} />
      <FinalCta ctaText={siteSettings?.ctaText} />
    </>
  );
}
