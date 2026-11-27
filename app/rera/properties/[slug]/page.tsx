import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  MapPin,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import prisma from '@/lib/prisma';
import PropertyImageGallery from '@/components/rera/PropertyImageGallery';
import ReraHomeMotion from '@/components/rera/ReraHomeMotion';
import { SectionRenderer } from '@/components/rera/property-sections/SectionRenderer';
import { reraPropertySectionSchema } from '@/lib/rera/property-sections/schemas';
import { parseReraPropertyAmenityImages } from '@/lib/rera/property-amenity-images';

interface PropertyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const properties = await prisma.reraProperty.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    return properties.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const property = await prisma.reraProperty.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        locality: true,
        city: true,
        coverImageUrl: true,
        isPublished: true,
      },
    });

    if (!property || !property.isPublished) {
      return {
        title: 'Property Not Found | REALSPACE',
      };
    }

    const title = `${property.title} | REALSPACE Property in ${property.locality}, ${property.city}`;
    const description = property.description
      ? property.description.slice(0, 160)
      : `${property.title} in ${property.locality}, ${property.city}.`;

    return {
      title,
      description,
      openGraph: {
        title: `${property.title} | REALSPACE`,
        description,
        ...(property.coverImageUrl
          ? {
              images: [
                {
                  url: property.coverImageUrl,
                  width: 1200,
                  height: 630,
                  alt: property.title,
                },
              ],
            }
          : {}),
      },
    };
  } catch {
    return {
      title: 'Property | REALSPACE',
    };
  }
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;

  let property = null;

  try {
    property = await prisma.reraProperty.findUnique({
      where: { slug },
      include: {
        category: true,
        sections: {
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  } catch {
    notFound();
  }

  if (!property || !property.isPublished) {
    notFound();
  }

  const validSections = property.sections.flatMap((section) => {
    const parsed = reraPropertySectionSchema.safeParse(section);
    return parsed.success ? [parsed.data] : [];
  });
  const amenityImages = parseReraPropertyAmenityImages(property.amenityImages);

  const mediaList = property.coverImageUrl
    ? [{ id: 'cover', url: property.coverImageUrl, altText: property.title, mediaType: 'IMAGE' as const }]
    : [];

  return (
    <ReraHomeMotion>
    <div className="w-full bg-[#F8F5F1]">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-[#E8E2DA] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link
            href={reraPath('/properties')}
            className="inline-flex items-center gap-1.5 text-[#6D6A66] hover:text-[#0088CC] font-semibold transition-colors uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Properties</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#1C1C1C] text-[#C8A96A]">
              {property.locality}
            </span>
            {property.category?.isPublished && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#C8A96A] text-[#1C1C1C]">
                {property.category.name}
              </span>
            )}
            {property.projectReraNo && (
              <span className="text-xs text-[#6D6A66] hidden sm:inline">
                Project RERA No. {property.projectReraNo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Showcase Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div>
          <header className="mb-5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
              {property.title}
            </h1>
            {property.bhkLabel && (
              <p className="mt-2 text-base sm:text-lg font-medium text-[#1C1C1C]">
                {property.bhkLabel}
              </p>
            )}
            {property.tagline && (
              <p className="mt-2 whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#6D6A66]">
                {property.tagline}
              </p>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className={property.description ? "lg:col-span-8" : "lg:col-span-12"}>
              <PropertyImageGallery
                media={mediaList}
                propertyTitle={property.title}
                coverImageUrl={property.coverImageUrl}
              />
            </div>
            {property.description && (
              <aside className="lg:col-span-4 flex items-center justify-center border border-[#E8E2DA] bg-white p-6 sm:p-8">
                <div className="w-full text-center">
                  <h2 className="font-heading text-lg sm:text-xl font-bold uppercase text-[#1C1C1C]">
                    {property.title} Overview
                  </h2>
                  <p className="mt-5 bg-white px-4 py-4 text-sm leading-7 text-[#6D6A66] shadow-[0_12px_32px_rgba(28,28,28,0.10)] whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              </aside>
            )}
          </div>

          {/* Property Details and Page Sections */}
          <div className="mt-8 bg-white border border-[#E8E2DA] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {property.projectReraNo && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    Project RERA No. {property.projectReraNo}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6D6A66] mt-1">
                  <MapPin className="w-4 h-4 text-[#C8A96A] shrink-0" />
                  <span>{property.locality}, {property.city}</span>
                </div>
              </div>
              {property.category?.isPublished && (
                <span className="inline-flex bg-[#C8A96A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1C1C1C]">
                  {property.category.name}
                </span>
              )}
            </div>

              {validSections.map((section, index) => (
                <div
                  key={section.id ?? `${section.type}-${section.sortOrder ?? index}`}
                  className={
                    section.type === 'PHASE_CARDS' && validSections[index - 1]?.type === 'INFO_CARDS'
                      ? 'border-t border-[#D5DDEB] pt-6'
                      : undefined
                  }
                >
                  <SectionRenderer section={section} />
                </div>
              ))}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#E8E2DA]">
                  <h3 className="font-heading text-lg font-bold text-center text-[#1C1C1C]">
                    Amenities &amp; Facilities
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    {property.amenities.map((amenity, idx) => {
                      const amenityImage = amenityImages.find(
                        (item) => item.amenity.toLowerCase() === amenity.toLowerCase()
                      );
                      return (
                        <div
                          key={idx}
                          className="flex min-w-24 flex-col items-center gap-2 border border-[#E8E2DA] bg-[#F8F5F1] px-3 py-3 text-center text-[#1C1C1C]"
                        >
                          {amenityImage ? (
                            <div className="relative h-16 w-16">
                              <Image
                                src={amenityImage.url}
                                alt={`${amenity} illustration`}
                                fill
                                sizes="64px"
                                className="object-contain"
                                unoptimized={!amenityImage.url.includes('res.cloudinary.com')}
                              />
                            </div>
                          ) : null}
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
        </div>
      </section>
    </div>
    </ReraHomeMotion>
  );
}
