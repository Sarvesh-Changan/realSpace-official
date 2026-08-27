import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { Hero } from "./_components/home/Hero";
import { ActiveOffers, type OfferType } from "./_components/home/ActiveOffers";
import { TrustStats } from "./_components/home/TrustStats";
import { Projects, type ProjectType } from "./_components/home/Projects";
import { Services } from "./_components/home/Services";
import { GalleryTeaser, type GalleryTeaserItem } from "./_components/home/GalleryTeaser";
import { VideoTestimonials, type VideoTestimonialItem } from "./_components/home/VideoTestimonials";
import { FinalCta } from "./_components/home/FinalCta";

export const revalidate = 60; // Revalidate static cache every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";
  const headline = settings?.heroHeadline || "Interior & Exterior Design Studio in Thane";
  const subhead = settings?.heroSubhead || "Transform your residential or commercial space with REALSPACE, Thane's premier design studio.";

  return constructMetadata({
    title: `${companyName} — ${headline}`,
    description: subhead,
    path: "",
  });
}

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
    title: string | null;
    description: string | null;
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
  let rawVideoTestimonials: Array<{
    id: string;
    clientName: string;
    projectType: string | null;
    location: string | null;
    slug: string | null;
    videoUrl: string | null;
    thumbnailUrl: string | null;
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
      fetchedVideoTestimonials,
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
        where: {
          isPublished: true,
          videoUrl: { not: null },
        },
        select: {
          id: true,
          clientName: true,
          projectType: true,
          location: true,
          slug: true,
          videoUrl: true,
          thumbnailUrl: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
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
    rawVideoTestimonials = fetchedVideoTestimonials;
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
      "/images/placeholder-image.png",
  }));

  const exteriorProjects: ProjectType[] = rawExteriorProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    location: p.location,
    category: formatCategory(p.category),
    imageUrl:
      p.images[0]?.url ||
      "/images/placeholder-image.png",
  }));

  // Map database gallery image models to GalleryTeaserItem props
  const galleryTeaserItems: GalleryTeaserItem[] = rawGalleryImages.map((img) => ({
    id: img.id,
    title: img.title,
    category: img.category?.name || "Gallery",
    imageUrl: img.url,
  }));

  const videoTestimonialItems: VideoTestimonialItem[] = rawVideoTestimonials.flatMap((item) => {
    if (!item.videoUrl) return [];
    return [{
      id: item.id,
      title: item.projectType || "A REALSPACE design story",
      clientName: item.clientName,
      location: item.location,
      slug: item.slug,
      videoUrl: item.videoUrl,
      thumbnailUrl: item.thumbnailUrl,
    }];
  });

  return (
    <>
      <Hero
        heroHeadline={siteSettings?.heroHeadline}
        heroSubhead={siteSettings?.heroSubhead}
        ctaText={siteSettings?.ctaText}
      />
      <ActiveOffers offers={offers} />
      <TrustStats />
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
      <VideoTestimonials testimonials={videoTestimonialItems} />
      <FinalCta ctaText={siteSettings?.ctaText} />
    </>
  );
}
