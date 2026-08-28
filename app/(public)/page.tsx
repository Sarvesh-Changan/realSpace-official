import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Hero } from "./_components/home/Hero";
import { WelcomeIntro } from "./_components/home/WelcomeIntro";
import { Projects, type ProjectType } from "./_components/home/Projects";
import { Services } from "./_components/home/Services";
import { GalleryTeaser, type GalleryTeaserItem } from "./_components/home/GalleryTeaser";
import { VideoTestimonials, type VideoTestimonialItem } from "./_components/home/VideoTestimonials";

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
    images: Array<{ url: string; isCoverImage: boolean }>;
  }> = [];
  let rawExteriorProjects: Array<{
    id: string;
    slug: string;
    title: string;
    location: string;
    category: string;
    images: Array<{ url: string; isCoverImage: boolean }>;
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
    imageUrl: string | null;
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
            orderBy: [
              { isCoverImage: "desc" },
              { sortOrder: "asc" },
            ],
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
            orderBy: [
              { isCoverImage: "desc" },
              { sortOrder: "asc" },
            ],
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
        },
        select: {
          id: true,
          clientName: true,
          projectType: true,
          location: true,
          slug: true,
          videoUrl: true,
          imageUrl: true,
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

  // Map database project models to ProjectType props for subcomponents
  const interiorProjects: ProjectType[] = rawInteriorProjects.map((p) => {
    const coverImage = p.images.find((image) => image.isCoverImage) || p.images[0];

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      location: p.location,
      category: formatCategory(p.category),
      imageUrl:
        coverImage?.url ||
        "/images/placeholder-image.png",
    };
  });

  const exteriorProjects: ProjectType[] = rawExteriorProjects.map((p) => {
    const coverImage = p.images.find((image) => image.isCoverImage) || p.images[0];

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      location: p.location,
      category: formatCategory(p.category),
      imageUrl:
        coverImage?.url ||
        "/images/placeholder-image.png",
    };
  });

  // Map database gallery image models to GalleryTeaserItem props
  const galleryTeaserItems: GalleryTeaserItem[] = rawGalleryImages.map((img) => ({
    id: img.id,
    title: img.title,
    category: img.category?.name || "Gallery",
    imageUrl: img.url,
  }));

  const videoTestimonialItems: VideoTestimonialItem[] = rawVideoTestimonials.flatMap((item) => {
    if (!item.videoUrl && !item.imageUrl && !item.thumbnailUrl) return [];
    return [{
      id: item.id,
      title: item.projectType || "A REALSPACE design story",
      clientName: item.clientName,
      location: item.location,
      slug: item.slug,
      videoUrl: item.videoUrl,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl,
    }];
  });

  return (
    <>
      <Hero
        heroHeadline={siteSettings?.heroHeadline}
        heroSubhead={siteSettings?.heroSubhead}
        ctaText={siteSettings?.ctaText}
        socialLinks={siteSettings?.socialLinks as {
          instagram?: string | null;
          facebook?: string | null;
          youtube?: string | null;
          linkedin?: string | null;
          linkedinUrl?: string | null;
        } | null}
      />
      <WelcomeIntro intro={siteSettings?.heroSubhead} />
      <Projects
        title="Interior Projects"
        subtitle="Explore our curated portfolio of bespoke interior transformations."
        projects={interiorProjects}
        viewAllLink="/projects?type=interior"
      />
      <Projects
        title="Exterior Projects"
        subtitle="Discover our striking architectural facades and outdoor spaces."
        projects={exteriorProjects}
        viewAllLink="/projects?type=exterior"
      />
      <Services services={services} />
      <GalleryTeaser items={galleryTeaserItems} />
      <VideoTestimonials testimonials={videoTestimonialItems} />
      <section className="bg-brand-cream px-4 py-14 sm:py-20">
        <div className="flex justify-center">
          <Link href="/quote">
            <Button
              size="lg"
              className="group min-h-[52px] gap-3 rounded-full border border-brand-red bg-brand-red px-8 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-brand-dark hover:bg-brand-dark hover:shadow-xl sm:px-10"
            >
              Get Free Quote
              <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
