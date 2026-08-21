import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";

import { Hero } from "../_components/home/Hero";
import { ActiveOffers, type OfferType } from "../_components/home/ActiveOffers";
import { TrustStats } from "../_components/home/TrustStats";
import { Positioning } from "../_components/home/Positioning";
import { Projects, type ProjectType } from "../_components/home/Projects";
import { Services } from "../_components/home/Services";
import { GalleryTeaser, type GalleryTeaserItem } from "../_components/home/GalleryTeaser";
import { Testimonials } from "../_components/home/Testimonials";
import { FinalCta } from "../_components/home/FinalCta";

export const revalidate = 60; // Revalidate every 60 seconds

interface LocalityConfig {
  slug: string;
  name: string;
  headline: string;
  subhead: string;
  description: string;
}

const LOCALITIES: Record<string, LocalityConfig> = {
  majiwada: {
    slug: "majiwada",
    name: "Majiwada",
    headline: "Premier Interior & Exterior Designers in Majiwada, Thane",
    subhead: "Transform your Majiwada home or commercial property with custom 3D interior design and architectural exterior solutions by REALSPACE.",
    description: "Looking for top-rated interior designers in Majiwada, Thane? REALSPACE specializes in end-to-end luxury interiors, 3D elevation designs, modular kitchens, and custom space planning.",
  },
  "ghodbunder-road": {
    slug: "ghodbunder-road",
    name: "Ghodbunder Road",
    headline: "Expert Interior Design Studio on Ghodbunder Road, Thane",
    subhead: "Elevate your Ghodbunder Road residence with modern interior architecture and facade elevation by REALSPACE.",
    description: "REALSPACE offers bespoke interior design and architectural exterior solutions for high-rise apartments and villas along Ghodbunder Road, Thane.",
  },
  "kolshet-road": {
    slug: "kolshet-road",
    name: "Kolshet Road",
    headline: "Luxury Interior & Exterior Design Services in Kolshet Road, Thane",
    subhead: "Bespoke residential interiors and exterior elevations tailored for Kolshet Road homeowners.",
    description: "Discover custom interior design services in Kolshet Road, Thane. From modular kitchens and living rooms to complete home transformations by REALSPACE.",
  },
  "hiranandani-estate": {
    slug: "hiranandani-estate",
    name: "Hiranandani Estate",
    headline: "High-End Interior & Exterior Designers in Hiranandani Estate, Thane",
    subhead: "Crafting timeless, elegant interiors and premium exterior elevations in Hiranandani Estate.",
    description: "Transform your home in Hiranandani Estate, Thane with REALSPACE's signature interior design, space planning, and custom woodworking services.",
  },
};

export async function generateStaticParams() {
  return Object.keys(LOCALITIES).map((slug) => ({
    locality: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locality: string }>;
}): Promise<Metadata> {
  const { locality: slug } = await params;
  const locality = LOCALITIES[slug];
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";

  if (!locality) {
    return constructMetadata({ title: "Page Not Found", path: `/${slug}` });
  }

  return constructMetadata({
    title: `${locality.headline} | ${companyName}`,
    description: locality.description,
    path: `/${slug}`,
  });
}

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function LocalityPage({
  params,
}: {
  params: Promise<{ locality: string }>;
}) {
  const { locality: slug } = await params;
  const locality = LOCALITIES[slug];

  if (!locality) {
    notFound();
  }

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
    category?: { name: string } | null;
  }> = [];

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      fetchedOffers,
      fetchedInterior,
      fetchedExterior,
      fetchedServices,
      fetchedTestimonials,
      fetchedGalleryImages,
    ] = await Promise.all([
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

    rawOffers = fetchedOffers;
    rawInteriorProjects = fetchedInterior;
    rawExteriorProjects = fetchedExterior;
    services = fetchedServices;
    testimonials = fetchedTestimonials;
    rawGalleryImages = fetchedGalleryImages;
  } catch (error) {
    console.error("Error loading locality page data from Prisma:", error);
  }

  const offers: OfferType[] = rawOffers.map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    imageUrl: o.imageUrl,
    ctaLabel: o.ctaLabel,
    ctaLink: o.ctaLink,
  }));

  const interiorProjects: ProjectType[] = rawInteriorProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    location: p.location,
    category: formatCategory(p.category),
    imageUrl: p.images[0]?.url || "/images/placeholder-image.png",
  }));

  const exteriorProjects: ProjectType[] = rawExteriorProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    location: p.location,
    category: formatCategory(p.category),
    imageUrl: p.images[0]?.url || "/images/placeholder-image.png",
  }));

  const galleryTeaserItems: GalleryTeaserItem[] = rawGalleryImages.map((img) => ({
    id: img.id,
    title: img.title,
    category: img.category?.name || "Gallery",
    imageUrl: img.url,
  }));

  return (
    <>
      <Hero
        heroHeadline={locality.headline}
        heroSubhead={locality.subhead}
      />
      <ActiveOffers offers={offers} />
      <TrustStats />
      <Positioning />
      <Projects
        title={`Selected Interior Projects in ${locality.name}`}
        subtitle="Explore our curated portfolio of bespoke interior transformations."
        projects={interiorProjects}
        viewAllLink="/projects?type=interior"
      />
      <Projects
        title={`Selected Exterior Projects in ${locality.name}`}
        subtitle="Discover our striking architectural facades and outdoor spaces."
        projects={exteriorProjects}
        viewAllLink="/projects?type=exterior"
      />
      <Services services={services} />
      <GalleryTeaser items={galleryTeaserItems} />
      <Testimonials testimonials={testimonials} />
      <FinalCta />
    </>
  );
}
