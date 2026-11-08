'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  MapPin,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  MessageCircle,
  Maximize2,
  Share2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Property } from '@/types';
import { companyData } from '@/data/company';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onBookVisit: (propTitle: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onBookVisit,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!property) return null;

  const gallery = property.gallery && property.gallery.length > 0
    ? property.gallery
    : [property.heroImage];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

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
              {property.microMarket}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#6D6A66] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96A]" />
              MahaRERA: {property.reraId}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1] transition-colors"
            aria-label="Close Property Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery Carousel */}
        <div className="relative aspect-[16/9] w-full bg-[#1C1C1C] overflow-hidden">
          <Image
            src={gallery[activeImageIndex]}
            alt={`${property.title} view ${activeImageIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />

          {gallery.length > 1 && (
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
                {activeImageIndex + 1} / {gallery.length}
              </div>
            </>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Title & Pricing Block */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[#E8E2DA]">
            <div>
              <div className="text-xs font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                {property.developer ? `${property.developer} · ` : ''}
                {property.configuration}
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                {property.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#6D6A66] mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="md:text-right">
              <div className="text-[10px] uppercase tracking-wider text-[#A39E98] font-semibold">
                Investment Value
              </div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                {property.priceDisplay}
              </div>
              <div className="text-[11px] text-[#6D6A66] mt-0.5">
                Carpet Area: <strong className="text-[#1C1C1C]">{property.carpetAreaSqFt} Sq.Ft</strong>
              </div>
            </div>
          </div>

          {/* Quick Metrics Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F8F5F1] border border-[#E8E2DA] text-xs">
            <div>
              <span className="text-[#6D6A66] block text-[10px] uppercase font-semibold">Configuration</span>
              <strong className="text-[#1C1C1C] text-sm">{property.configuration}</strong>
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
              <strong className="text-[#C8A96A] text-sm font-bold">0% (Direct Partner)</strong>
            </div>
          </div>

          {/* Description & Subtitle */}
          <div>
            <h4 className="font-heading text-lg font-bold text-[#1C1C1C] mb-2">
              Property Overview
            </h4>
            <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
              {property.subtitle}. Vetted by the legal compliance desk at Arnav Properties. Zero dead space architectural floor layout with optimal natural ventilation and Yeoor Hills / city lake views.
            </p>
          </div>

          {/* Key Highlights */}
          {property.highlights && property.highlights.length > 0 && (
            <div>
              <h4 className="font-heading text-base font-bold text-[#1C1C1C] mb-3">
                Key Strategic Highlights
              </h4>
              <div className="space-y-2">
                {property.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#444444]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C8A96A] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Table */}
          {property.specifications && Object.keys(property.specifications).length > 0 && (
            <div>
              <h4 className="font-heading text-base font-bold text-[#1C1C1C] mb-3">
                Architectural Specifications
              </h4>
              <div className="border border-[#E8E2DA] divide-y divide-[#E8E2DA] text-xs">
                {Object.entries(property.specifications).map(([key, val]) => (
                  <div key={key} className="flex flex-col sm:flex-row py-2.5 px-3.5 bg-white">
                    <span className="w-40 font-semibold text-[#1C1C1C] shrink-0">{key}:</span>
                    <span className="text-[#444444]">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h4 className="font-heading text-base font-bold text-[#1C1C1C] mb-3">
                Curated Amenities & Facilities
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

          {/* REALSPACE Turnkey Interior Guarantee Note */}
          <div className="p-5 bg-[#1C1C1C] text-white border border-[#333333]">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#C8A96A] mb-1">
              <Sparkles className="w-4 h-4" />
              REALSPACE Interior Readiness
            </div>
            <p className="text-xs text-[#EEE6DD]/90 leading-relaxed">
              This unit has pre-engineered 2D/3D interior blueprints drafted by Vijay Chawan. Benefit from a 45-day guaranteed modular turnkey execution with custom Italian marble and German joinery.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#E8E2DA] flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                onBookVisit(property.title);
              }}
              className="flex-1 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Schedule Chauffeured Site Visit</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/${companyData.phones.whatsapp}?text=Hello%20Vijay%2C%20I%20am%20interested%20in%20${encodeURIComponent(property.title)}%20(${encodeURIComponent(property.priceDisplay)}).%20Please%20share%20floor%20plans.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Details</span>
            </a>

            <a
              href={`tel:${companyData.phones.primary.replace(/\s+/g, '')}`}
              className="px-6 py-3.5 border border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-[#C8A96A] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Founder</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
