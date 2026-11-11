'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Building,
} from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';

export interface ReraPropertyDetailData {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceLabel: string;
  priceAmount: number | null;
  locality: string;
  city: string;
  projectName: string | null;
  builderName: string | null;
  projectReraNo: string | null;
  possession: string | null;
  carpetAreaSqFt: number | null;
  builtUpAreaSqFt: number | null;
  bhkLabel: string | null;
  furnishing: string | null;
  amenities: string[];
  specifications: Array<{ label: string; value: string }> | Record<string, string> | null;
  coverImageUrl: string | null;
  images: Array<{
    id: string;
    url: string;
    altText: string;
    mediaType: 'IMAGE' | 'VIDEO';
  }>;
}

interface PropertyDetailModalProps {
  property: ReraPropertyDetailData | null;
  onClose: () => void;
  onBookVisit?: (propTitle: string) => void;
  phone?: string | null;
  whatsapp?: string | null;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onBookVisit,
  phone = '',
  whatsapp = '',
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mediaList =
    property?.images && property.images.length > 0
      ? property.images
      : property?.coverImageUrl
      ? [{ id: 'cover', url: property.coverImageUrl, altText: property.title, mediaType: 'IMAGE' as const }]
      : [];

  useEffect(() => {
    if (!property) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.target instanceof HTMLVideoElement) return;

      if (event.key === 'ArrowRight' && mediaList.length > 1) {
        event.preventDefault();
        setActiveImageIndex((prev) => (prev + 1) % mediaList.length);
      } else if (event.key === 'ArrowLeft' && mediaList.length > 1) {
        event.preventDefault();
        setActiveImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mediaList.length, onClose, property]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [property?.id]);

  if (!property) return null;

  const phoneClean = (phone ?? '').replace(/\s+/g, '');

  const nextImage = () => {
    if (mediaList.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % mediaList.length);
    }
  };

  const prevImage = () => {
    if (mediaList.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    }
  };

  const activeMedia = mediaList[activeImageIndex];

  // Parse specifications into a uniform array of { label, value }
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex h-[96vh] w-full max-w-7xl flex-col overflow-hidden bg-white border border-[#E8E2DA] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-[#E8E2DA]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#1C1C1C] text-[#C8A96A]">
              {property.locality}
            </span>
            {property.projectReraNo && (
              <span className="flex items-center gap-1 text-xs text-[#6D6A66] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96A]" />
                Project RERA No. {property.projectReraNo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`${reraPath('/properties')}/${property.slug}`}
              className="p-1.5 text-[#6D6A66] transition-colors hover:bg-[#F8F5F1] hover:text-[#1C1C1C]"
              aria-label="Open full property page"
              title="Open full property page"
            >
              <ArrowUpRight className="h-5 w-5" />
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 text-[#6D6A66] hover:bg-[#F8F5F1] hover:text-[#1C1C1C] transition-colors"
              aria-label="Close Property Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[1.05fr_0.95fr] md:overflow-hidden">
        {/* Gallery Carousel / Viewer */}
        {activeMedia ? (
          <div className="relative flex h-[38vh] min-h-[240px] w-full flex-col overflow-hidden bg-[#1C1C1C] md:h-auto md:min-h-0">
            <div className="relative min-h-0 flex-1">
            {activeMedia.mediaType === 'VIDEO' ? (
              <video
                controls
                poster={property.coverImageUrl || undefined}
                className="w-full h-full object-contain"
                key={activeMedia.url}
              >
                <source src={activeMedia.url} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                src={activeMedia.url}
                alt={activeMedia.altText || property.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
              />
            )}
            </div>

            {mediaList.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white hover:bg-black/90 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white hover:bg-black/90 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5">
                  {activeImageIndex + 1} / {mediaList.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex h-[38vh] min-h-[240px] w-full items-center justify-center bg-[#EEE6DD] text-sm text-[#A39E98] md:h-auto md:min-h-0">
            {property.title}
          </div>
        )}

        {/* Content Body */}
        <div className="min-h-0 space-y-5 overflow-y-auto p-5 sm:p-6 md:flex md:flex-col md:gap-3 md:space-y-0 md:overflow-hidden md:p-4">
          {/* Title & Pricing Block */}
          <div className="flex shrink-0 flex-col justify-between gap-2 border-b border-[#E8E2DA] pb-3 sm:flex-row sm:items-start">
            <div>
              <div className="text-xs font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                {property.builderName ? `${property.builderName} · ` : ''}
                {property.bhkLabel ?? ''}
              </div>
              <h2 className="font-heading text-lg font-bold leading-tight text-[#1C1C1C] sm:text-xl">
                {property.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#6D6A66] mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                <span>
                  {property.locality}, {property.city}
                </span>
              </div>
            </div>

            <div className="shrink-0 sm:text-right">
              <div className="text-[10px] uppercase tracking-wider text-[#A39E98] font-semibold">
                Pricing
              </div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                {property.priceLabel}
              </div>
              {property.carpetAreaSqFt && (
                <div className="text-[11px] text-[#6D6A66] mt-0.5">
                  Carpet Area: <strong className="text-[#1C1C1C]">{property.carpetAreaSqFt} Sq.Ft</strong>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Matrix */}
          <div className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-2 border border-[#E8E2DA] bg-[#F8F5F1] p-3 text-xs sm:grid-cols-4">
            {property.bhkLabel && (
              <div>
                <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">
                  Configuration
                </span>
                <strong className="text-[#1C1C1C] text-sm">{property.bhkLabel}</strong>
              </div>
            )}
            {property.carpetAreaSqFt && (
              <div>
                <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">
                  Carpet Area
                </span>
                <strong className="text-[#1C1C1C] text-sm">{property.carpetAreaSqFt} Sq.Ft</strong>
              </div>
            )}
            {property.builtUpAreaSqFt && (
              <div>
                <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">
                  Built-Up Area
                </span>
                <strong className="text-[#1C1C1C] text-sm">{property.builtUpAreaSqFt} Sq.Ft</strong>
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

          {/* Description */}
          {property.description && (
            <div className="md:flex md:min-h-0 md:flex-1 md:flex-col">
              <h4 className="font-heading text-lg font-bold text-[#1C1C1C] mb-2 md:shrink-0 md:text-base md:mb-1">
                Property Overview
              </h4>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed whitespace-pre-line md:min-h-0 md:flex-1 md:overflow-y-auto">
                {property.description}
              </p>
            </div>
          )}

          {/* Architectural Specifications Table */}
          {specsList.length > 0 && (
            <div className="shrink-0">
              <h4 className="font-heading text-base font-bold text-[#1C1C1C] mb-2">
                Architectural Specifications
              </h4>
              <div className="border border-[#E8E2DA] divide-y divide-[#E8E2DA] text-[11px]">
                {specsList.map((spec, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row py-1.5 px-3 bg-white">
                    <span className="w-32 font-semibold text-[#1C1C1C] shrink-0">{spec.label}:</span>
                    <span className="text-[#444444]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="shrink-0">
              <h4 className="font-heading text-base font-bold text-[#1C1C1C] mb-3">
                Curated Amenities &amp; Facilities
              </h4>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#F8F5F1] border border-[#E8E2DA] text-[#1C1C1C]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-[#E8E2DA] pt-3">
            <button
              onClick={() => {
                onClose();
                if (onBookVisit) onBookVisit(property.title);
                else {
                  window.dispatchEvent(
                    new CustomEvent('open-consultation-modal', {
                      detail: {
                        interest: `Site Visit for ${property.title}`,
                        propertySlug: property.slug,
                        source: 'SITE_VISIT',
                      },
                    })
                  );
                }
              }}
              className="col-span-2 flex items-center justify-center gap-2 bg-[#C8A96A] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] shadow-sm transition-colors hover:bg-[#B78A47] hover:text-white sm:col-span-1"
            >
              <span>Schedule Site Visit</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(
                  new CustomEvent('open-consultation-modal', {
                    detail: {
                      interest: `Property Enquiry: ${property.title}`,
                      propertySlug: property.slug,
                      source: 'PROPERTY_ENQUIRY',
                    },
                  })
                );
              }}
              className="inline-flex items-center justify-center gap-2 border border-[#1C1C1C] px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C] hover:text-[#C8A96A]"
            >
              <span>Enquire</span>
            </button>

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=Hello%2C%20I%20am%20interested%20in%20${encodeURIComponent(property.title)}%20(${encodeURIComponent(property.priceLabel)}).%20Please%20share%20details.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#20ba5a]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Details</span>
              </a>
            )}

            {phoneClean && (
              <a
                href={`tel:${phoneClean}`}
                className="inline-flex items-center justify-center gap-2 border border-[#1C1C1C] px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C] hover:text-[#C8A96A]"
              >
                <Phone className="w-4 h-4" />
                <span>Call Us</span>
              </a>
            )}

          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
