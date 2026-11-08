import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  MessageCircle,
  ArrowRight,
  Share2,
  ChevronLeft,
} from 'lucide-react';
import { propertiesData } from '@/data/properties';
import { companyData } from '@/data/company';

export function generateStaticParams() {
  return propertiesData.map((property) => ({
    slug: property.slug,
  }));
}

interface PropertyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = propertiesData.find((p) => p.slug === slug);

  if (!property) {
    return {
      title: 'Property Not Found | REALSPACE & Arnav Properties',
    };
  }

  return {
    title: `${property.title} | REALSPACE & Arnav Properties Thane`,
    description: `${property.subtitle}. Carpet Area: ${property.carpetAreaSqFt} Sq.Ft. Located in ${property.location}. MahaRERA: ${property.reraId}. Price: ${property.priceDisplay}.`,
    openGraph: {
      title: `${property.title} – ${property.priceDisplay}`,
      description: property.subtitle,
      images: [
        {
          url: property.heroImage,
          width: 1200,
          height: 800,
          alt: property.title,
        },
      ],
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = propertiesData.find((p) => p.slug === slug);

  if (!property) {
    notFound();
  }

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="bg-white border-b border-[#E8E2DA] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-[#6D6A66] hover:text-[#0088CC] font-semibold transition-colors uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Properties</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#1C1C1C] text-[#C8A96A]">
              {property.microMarket}
            </span>
            <span className="text-xs text-[#6D6A66] hidden sm:inline">
              MahaRERA: {property.reraId}
            </span>
          </div>
        </div>
      </div>

      {/* Main Showcase Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery & Highlights */}
          <div className="lg:col-span-8 space-y-8">
            {/* Primary Hero Photo */}
            <div className="relative aspect-[16/10] w-full border border-[#E8E2DA] overflow-hidden bg-[#EEE6DD] shadow-md">
              <Image
                src={property.heroImage}
                alt={property.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-[#1C1C1C]/90 backdrop-blur-sm text-[#C8A96A] text-xs font-semibold uppercase tracking-wider px-3 py-1">
                {property.configuration}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {property.gallery && property.gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {property.gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[16/10] border border-[#E8E2DA] overflow-hidden bg-[#EEE6DD]"
                  >
                    <Image
                      src={imgUrl}
                      alt={`${property.title} detail ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 33vw, 20vw"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Property Narrative & Details */}
            <div className="bg-white border border-[#E8E2DA] p-6 sm:p-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  MahaRERA Verified: {property.reraId}
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C]">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6D6A66] mt-2">
                  <MapPin className="w-4 h-4 text-[#C8A96A] shrink-0" />
                  <span>{property.location}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                {property.subtitle}. Vetted by the legal compliance desk at Arnav Properties (MahaRERA Reg No: A51700001581). Offering an optimal balance of accessibility, lifestyle amenities, and long-term capital appreciation in Thane.
              </p>

              {/* 4-Item Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F8F5F1] border border-[#E8E2DA] text-xs">
                <div>
                  <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">Carpet Area</span>
                  <strong className="text-[#1C1C1C] text-sm">{property.carpetAreaSqFt} Sq.Ft</strong>
                </div>
                <div>
                  <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">Possession</span>
                  <strong className="text-[#1C1C1C] text-sm">{property.possessionStatus}</strong>
                </div>
                <div>
                  <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">Furnishing</span>
                  <strong className="text-[#1C1C1C] text-sm">{property.furnishing}</strong>
                </div>
                <div>
                  <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">Brokerage</span>
                  <strong className="text-[#C8A96A] text-sm font-bold">0% Direct Partner</strong>
                </div>
              </div>

              {/* Strategic Highlights */}
              {property.highlights && property.highlights.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C]">
                    Project & Micro-Market Highlights
                  </h3>
                  <div className="space-y-2">
                    {property.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#444444]">
                        <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {property.specifications && Object.keys(property.specifications).length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#E8E2DA]">
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C]">
                    Architectural Specifications
                  </h3>
                  <div className="border border-[#E8E2DA] divide-y divide-[#E8E2DA] text-xs">
                    {Object.entries(property.specifications).map(([key, val]) => (
                      <div key={key} className="flex flex-col sm:flex-row py-2.5 px-4 bg-white">
                        <span className="w-44 font-semibold text-[#1C1C1C] shrink-0">{key}:</span>
                        <span className="text-[#444444]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#E8E2DA]">
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C]">
                    Amenities & Facilities
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

          {/* Right Column: Pricing & VIP Visit Booking Card */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Pricing Card */}
            <div className="bg-white border border-[#E8E2DA] p-6 shadow-sm space-y-4">
              <div className="border-b border-[#E8E2DA] pb-4">
                <div className="text-[10px] uppercase tracking-wider text-[#A39E98] font-bold">
                  All-Inclusive Quoted Price
                </div>
                <div className="font-heading text-3xl font-bold text-[#1C1C1C] mt-0.5">
                  {property.priceDisplay}
                </div>
                <div className="text-xs text-[#6D6A66] mt-1">
                  Carpet Rate: ~₹{Math.round(property.priceNumeric / property.carpetAreaSqFt).toLocaleString('en-IN')} / sq.ft
                </div>
              </div>

              {/* Direct Booking Actions */}
              <div className="space-y-2.5">
                <a
                  href={`tel:${companyData.phones.primary.replace(/\s+/g, '')}`}
                  className="w-full py-3.5 bg-[#1C1C1C] hover:bg-[#C8A96A] text-[#C8A96A] hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Vijay Chawan ({companyData.phones.primary})</span>
                </a>

                <a
                  href={`https://wa.me/${companyData.phones.whatsapp}?text=Hi%20Vijay%2C%20I%20am%20viewing%20the%20property%20listing%20for%20${encodeURIComponent(property.title)}%20(${encodeURIComponent(property.priceDisplay)}).%20Please%20send%20brochure%20and%20floor%20plan.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              <div className="pt-2 text-[11px] text-[#6D6A66] space-y-1">
                <div>✓ Zero Brokerage on direct developer units</div>
                <div>✓ Chauffeured site pickup available from Thane station</div>
                <div>✓ Pre-approved home loan files with SBI, HDFC & ICICI</div>
              </div>
            </div>

            {/* REALSPACE Interior Package Card */}
            <div className="bg-[#1C1C1C] text-white p-6 border border-[#333333]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C8A96A] mb-2">
                <Sparkles className="w-4 h-4" />
                REALSPACE Turnkey Option
              </div>
              <h4 className="font-heading text-lg font-bold mb-2">
                Turnkey Modular Interiors
              </h4>
              <p className="text-xs text-[#EEE6DD]/90 leading-relaxed mb-4">
                Have Vijay Chawan’s architectural studio design and execute your Italian marble flooring, false ceilings, and German modular kitchen in 45 days.
              </p>
              <Link
                href="/services#interiors"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8A96A] hover:underline"
              >
                <span>Learn About Interior Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
