import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Hero } from "./_components/home/Hero";
import { HomeOfferStrip } from "./_components/home/HomeOfferStrip";
import { WelcomeIntro } from "./_components/home/WelcomeIntro";
import { OwnerPortrait } from "./_components/home/OwnerPortrait";
import { KeyFeatures } from "./_components/home/KeyFeatures";
import { WhyRealspace } from "./_components/home/WhyRealspace";
import { GallerySlider, type GallerySliderItem } from "./_components/home/GallerySlider";
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
  let rawHomeGalleryImages: Array<{
    id: string;
    title: string;
    altText: string | null;
    url: string;
  }> = [];

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch all home page data safely
    const [
      fetchedSettings,
      fetchedOffers,
      fetchedVideoTestimonials,
      fetchedHomeGalleryImages,
    ] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
      prisma.offer.findMany({
        where: {
          isActive: true,
          showOnHome: true,
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: endOfToday } }] },
            { OR: [{ endDate: null }, { endDate: { gte: startOfToday } }] },
          ],
        },
        orderBy: { sortOrder: "asc" },
        take: 1,
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
      prisma.homeGalleryImage.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          altText: true,
          url: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 15,
      }),
    ]);

    siteSettings = fetchedSettings;
    rawOffers = fetchedOffers;
    rawVideoTestimonials = fetchedVideoTestimonials;
    rawHomeGalleryImages = fetchedHomeGalleryImages;
  } catch (error) {
    console.error("Error loading home page data from Prisma:", error);
    // Graceful fallback: empty states will be rendered by subcomponents
  }

  // Map database home gallery image models to GallerySliderItem props
  const gallerySliderItems: GallerySliderItem[] = rawHomeGalleryImages.map((img) => ({
    id: img.id,
    title: img.title,
    altText: img.altText || `${img.title} — REALSPACE interior design`,
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
      <HomeOfferStrip offer={rawOffers[0]} />
      <WelcomeIntro intro={siteSettings?.heroSubhead} />
      <OwnerPortrait />
      <KeyFeatures />
      <WhyRealspace />
      <GallerySlider items={gallerySliderItems} />
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
