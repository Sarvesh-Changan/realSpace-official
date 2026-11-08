import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import prisma from '@/lib/prisma';
import { PropertyBookingCard } from '@/components/rera/PropertyBookingCard';

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
        priceLabel: true,
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
      : `${property.title} in ${property.locality}, ${property.city}. Price: ${property.priceLabel}.`;

    return {
      title,
      description,
      openGraph: {
        title: `${property.title} — ${property.priceLabel}`,
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
  let settings = null;

  try {
    [property, settings] = await Promise.all([
      prisma.reraProperty.findUnique({
        where: { slug },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      prisma.reraSettings.findUnique({ where: { id: 'singleton' } }),
    ]);
  } catch {
    notFound();
  }

  if (!property || !property.isPublished) {
    notFound();
  }

  const phone = settings?.phone ?? '';
  const whatsapp = settings?.whatsapp ?? '';
  const phoneClean = phone.replace(/\s+/g, '');

  const mediaList =
    property.images.length > 0
      ? property.images
      : property.coverImageUrl
      ? [{ id: 'cover', url: property.coverImageUrl, altText: property.title, mediaType: 'IMAGE' as const }]
      : [];

  // Parse specifications
  const specsList: Array<{ label: string; value: string }> = [];
  if (Array.isArray(property.specifications)) {
    for (const item of property.specifications) {
      if (item && typeof item === 'object' && 'label' in item && 'value' in item) {
        specsList.push({ label: String(item.label), value: String(item.value) });
      }
    }
  } else if (property.specifications && typeof property.specifications === 'object') {
    for (const [k, v] of Object.entries(property.specifications)) {
      specsList.push({ label: k, value: String(v) });
    }
  }

  return (
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Primary Cover / Hero Media */}
            <div className="relative aspect-[16/10] w-full border border-[#E8E2DA] overflow-hidden bg-[#EEE6DD] shadow-md">
              {mediaList[0]?.mediaType === 'VIDEO' ? (
                <video
                  controls
                  poster={property.coverImageUrl || undefined}
                  className="w-full h-full object-contain"
                  key={mediaList[0].url}
                >
                  <source src={mediaList[0].url} />
                  Your browser does not support the video tag.
                </video>
              ) : mediaList[0] ? (
                <Image
                  src={mediaList[0].url}
                  alt={mediaList[0].altText || property.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#A39E98] text-sm">
                  {property.title}
                </div>
              )}
              {property.bhkLabel && (
                <div className="absolute top-4 left-4 bg-[#1C1C1C]/90 backdrop-blur-sm text-[#C8A96A] text-xs font-semibold uppercase tracking-wider px-3 py-1">
                  {property.bhkLabel}
                </div>
              )}
            </div>

            {/* Additional Gallery Items */}
            {mediaList.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mediaList.slice(1).map((media, idx) => (
                  <div
                    key={media.id || idx}
                    className="relative aspect-[16/10] border border-[#E8E2DA] overflow-hidden bg-[#EEE6DD]"
                  >
                    {media.mediaType === 'VIDEO' ? (
                      <video
                        controls
                        poster={property.coverImageUrl || undefined}
                        className="w-full h-full object-cover"
                      >
                        <source src={media.url} />
                      </video>
                    ) : (
                      <Image
                        src={media.url}
                        alt={media.altText || `${property.title} detail ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Property Narrative & Details */}
            <div className="bg-white border border-[#E8E2DA] p-6 sm:p-8 space-y-6">
              <div>
                {property.projectReraNo && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    Project RERA No. {property.projectReraNo}
                  </div>
                )}
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C]">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6D6A66] mt-2">
                  <MapPin className="w-4 h-4 text-[#C8A96A] shrink-0" />
                  <span>
                    {property.locality}, {property.city}
                  </span>
                </div>
              </div>

              {property.description && (
                <p className="text-xs sm:text-sm text-[#444444] leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              )}

              {/* Metric Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F8F5F1] border border-[#E8E2DA] text-xs">
                {property.carpetAreaSqFt && (
                  <div>
                    <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">
                      Carpet Area
                    </span>
                    <strong className="text-[#1C1C1C] text-sm">
                      {property.carpetAreaSqFt} Sq.Ft
                    </strong>
                  </div>
                )}
                {property.builtUpAreaSqFt && (
                  <div>
                    <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">
                      Built-Up Area
                    </span>
                    <strong className="text-[#1C1C1C] text-sm">
                      {property.builtUpAreaSqFt} Sq.Ft
                    </strong>
                  </div>
                )}
                {property.possession && (
                  <div>
                    <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">
                      Possession
                    </span>
                    <strong className="text-[#1C1C1C] text-sm">{property.possession}</strong>
                  </div>
                )}
                {property.furnishing && (
                  <div>
                    <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">
                      Furnishing
                    </span>
                    <strong className="text-[#1C1C1C] text-sm">{property.furnishing}</strong>
                  </div>
                )}
              </div>

              {/* Specifications */}
              {specsList.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#E8E2DA]">
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C]">
                    Architectural Specifications
                  </h3>
                  <div className="border border-[#E8E2DA] divide-y divide-[#E8E2DA] text-xs">
                    {specsList.map((spec, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row py-2.5 px-4 bg-white">
                        <span className="w-44 font-semibold text-[#1C1C1C] shrink-0">
                          {spec.label}:
                        </span>
                        <span className="text-[#444444]">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#E8E2DA]">
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C]">
                    Amenities &amp; Facilities
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {property.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-[#F8F5F1] border border-[#E8E2DA] text-[#1C1C1C]"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Enquiry Booking Card */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <PropertyBookingCard
              propertySlug={property.slug}
              propertyTitle={property.title}
              priceLabel={property.priceLabel}
              priceAmount={property.priceAmount}
              carpetAreaSqFt={property.carpetAreaSqFt}
              phone={phone}
              whatsapp={whatsapp}
            />

            {/* Interior Sourcing Card */}
            <div className="bg-[#1C1C1C] text-white p-6 border border-[#333333]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C8A96A] mb-2">
                <Sparkles className="w-4 h-4" />
                REALSPACE Interiors
              </div>
              <h4 className="font-heading text-lg font-bold mb-2">Turnkey Interior Design</h4>
              <p className="text-xs text-[#EEE6DD]/90 leading-relaxed mb-4">
                Looking to transform this bare shell into a bespoke luxury residence? Benefit from
                architectural precision and modular execution.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8A96A] hover:underline"
              >
                <span>Explore REALSPACE Interiors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
