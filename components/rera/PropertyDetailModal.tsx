'use client';

import React, { useState } from 'react';
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

  if (!property) return null;

  const phoneClean = (phone ?? '').replace(/\s+/g, '');
  const mediaList =
    property.images && property.images.length > 0
      ? property.images
      : property.coverImageUrl
      ? [{ id: 'cover', url: property.coverImageUrl, altText: property.title, mediaType: 'IMAGE' as const }]
      : [];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white border border-[#E8E2DA] shadow-2xl overflow-y-auto max-h-[92vh]"
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

          <button
            onClick={onClose}
            className="p-1.5 text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1] transition-colors"
            aria-label="Close Property Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery Carousel / Viewer */}
        {activeMedia ? (
          <div className="relative aspect-[16/9] w-full bg-[#1C1C1C] overflow-hidden">
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
          <div className="aspect-[16/9] w-full bg-[#EEE6DD] flex items-center justify-center text-[#A39E98] text-sm">
            {property.title}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Title & Pricing Block */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[#E8E2DA]">
            <div>
              <div className="text-xs font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                {property.builderName ? `${property.builderName} · ` : ''}
                {property.bhkLabel ?? ''}
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                {property.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#6D6A66] mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                <span>
                  {property.locality}, {property.city}
                </span>
              </div>
            </div>

            <div className="md:text-right">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F8F5F1] border border-[#E8E2DA] text-xs">
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
            <div>
              <h4 className="font-heading text-lg font-bold text-[#1C1C1C] mb-2">
                Property Overview
              </h4>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* Architectural Specifications Table */}
          {specsList.length > 0 && (
            <div>
              <h4 className="font-heading text-base font-bold text-[#1C1C1C] mb-3">
                Architectural Specifications
              </h4>
              <div className="border border-[#E8E2DA] divide-y divide-[#E8E2DA] text-xs">
                {specsList.map((spec, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row py-2.5 px-3.5 bg-white">
                    <span className="w-40 font-semibold text-[#1C1C1C] shrink-0">{spec.label}:</span>
                    <span className="text-[#444444]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h4 className="font-heading text-base font-bold text-[#1C1C1C] mb-3">
                Curated Amenities &amp; Facilities
              </h4>
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

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#E8E2DA] flex flex-col sm:flex-row gap-3">
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
              className="flex-1 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
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
              className="px-6 py-3.5 border border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-[#C8A96A] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Enquire</span>
            </button>

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=Hello%2C%20I%20am%20interested%20in%20${encodeURIComponent(property.title)}%20(${encodeURIComponent(property.priceLabel)}).%20Please%20share%20details.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Details</span>
              </a>
            )}

            {phoneClean && (
              <a
                href={`tel:${phoneClean}`}
                className="px-6 py-3.5 border border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-[#C8A96A] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Us</span>
              </a>
            )}

            <Link
              href={`${reraPath('/properties')}/${property.slug}`}
              className="px-5 py-3.5 border border-[#E8E2DA] hover:border-[#1C1C1C] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors text-center inline-flex items-center justify-center"
            >
              Full Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
