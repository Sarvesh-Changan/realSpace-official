'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Award, Building, Users } from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';

export interface HeroSectionProps {
  onOpenConsultation?: () => void;
  onExploreProperties?: () => void;
  heroHeadline?: string | null;
  heroSubhead?: string | null;
  heroImageUrl?: string | null;
  heroSlides?: Array<{
    imageUrl: string;
    heading?: string;
    subheading?: string;
    buttonText?: string;
    slug?: string;
  }>;
  heroSlideInterval?: number;
  reraRegistrationNo?: string | null;
  brokerName?: string | null;
  founderName?: string | null;
  yearsExperience?: number | string | null;
  happyFamilies?: number | string | null;
  propertiesClosed?: number | string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreProperties,
  heroHeadline,
  heroSubhead,
  heroImageUrl,
  heroSlides = [],
  heroSlideInterval = 8,
  reraRegistrationNo,
  brokerName,
  yearsExperience,
  happyFamilies,
  propertiesClosed,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const hasSlideshow = heroSlides.length >= 3;

  useEffect(() => {
    if (!hasSlideshow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = Math.max(5, Math.min(15, heroSlideInterval)) * 1000;
    const timer = window.setInterval(() => {
      setActiveSlideIndex((current) => (current + 1) % heroSlides.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [hasSlideshow, heroSlideInterval, heroSlides.length]);

  const activeSlide = hasSlideshow ? heroSlides[activeSlideIndex] : null;
  const showPreviousSlide = () => setActiveSlideIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  const showNextSlide = () => setActiveSlideIndex((current) => (current + 1) % heroSlides.length);
  const handleExploreProperties = () => {
    if (onExploreProperties) {
      onExploreProperties();
    } else {
      const el = document.getElementById('featured-inventory');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const headline = activeSlide?.heading?.trim() || heroHeadline?.trim() || 'Find Your Dream Home in Thane';
  const subheading = activeSlide?.subheading?.trim() || heroSubhead?.trim();
  const backgroundImage = activeSlide?.imageUrl || heroImageUrl;
  const primaryButtonText = activeSlide?.buttonText?.trim() || 'Explore Properties';
  const primaryButtonSlug = activeSlide?.slug?.trim();

  return (
    <section className="relative w-full overflow-hidden bg-[#1C1C1C] text-white">
      {/* Background image (neutral fallback when missing) */}
      <div className="absolute inset-0 z-0">
        {backgroundImage ? (
          <Image
            key={backgroundImage}
            src={backgroundImage}
            alt={headline}
            fill
            priority
            sizes="100vw"
            className="animate-hero-background object-cover object-center"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1C] via-[#242424] to-[#141414]" />
        )}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/65 via-black/35 to-black/5"
      />
      {hasSlideshow && (
        <div className="absolute inset-x-3 top-1/2 z-20 flex -translate-y-1/2 justify-between sm:inset-x-6">
          <button
            type="button"
            onClick={showPreviousSlide}
            aria-label="Previous hero image"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-12 sm:w-12"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={showNextSlide}
            aria-label="Next hero image"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-12 sm:w-12"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-20 md:py-28 lg:py-32 flex flex-col justify-center min-h-[580px] [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
        {/* Editorial Trust Kicker with Typographic Separator */}
        <div className="inline-flex items-center gap-2.5 text-xs uppercase tracking-widest text-[#C8A96A] mb-5">
          {reraRegistrationNo ? (
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#C8A96A]" />
              MahaRERA: {reraRegistrationNo}
            </span>
          ) : (
            <span className="text-[#C8A96A] font-semibold">
              {brokerName || 'Thane & Mumbai Prime Real Estate'}
            </span>
          )}
          <span className="text-[#6D6A66]">·</span>
          <span className="text-[#EEE6DD]/80">Thane &amp; Mumbai MMR</span>
        </div>

        {/* Hero Headline */}
        <h1
          key={`hero-heading-${activeSlideIndex}`}
          className="animate-hero-heading font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-[1.15] max-w-3xl mb-6"
          style={{ textWrap: 'balance' }}
        >
          {headline}
        </h1>

        {/* Narrative Description */}
        {subheading && (
          <div key={`hero-subheading-${activeSlideIndex}`} className="mb-8 flex max-w-4xl items-center gap-4 text-center text-sm uppercase tracking-[0.18em] text-[#EEE6DD]/90 sm:text-base">
            <span aria-hidden="true" className="h-px flex-1 bg-white/80" />
            <p className="font-body">{subheading}</p>
            <span aria-hidden="true" className="h-px flex-1 bg-white/80" />
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
          {primaryButtonSlug ? (
            <Link
              key={`hero-button-${activeSlideIndex}`}
              href={reraPath(primaryButtonSlug)}
              className="animate-hero-button inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-md group"
            >
              <span>{primaryButtonText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <button
              key={`hero-button-${activeSlideIndex}`}
              onClick={handleExploreProperties}
              className="animate-hero-button inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-md group"
            >
              <span>{primaryButtonText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}

        </div>

        {/* Quiet Authority Footnote (only render when stats exist) */}
        {(yearsExperience || propertiesClosed || happyFamilies) && (
          <div className="mt-12 pt-8 border-t border-[#333333] flex flex-wrap items-center gap-6 text-xs text-[#A39E98]">
            {yearsExperience && (
              <>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C8A96A]" />
                  <span>{yearsExperience}+ Years in Real Estate Advisory</span>
                </div>
                <span className="text-[#444444] hidden sm:inline">|</span>
              </>
            )}
            {propertiesClosed && (
              <>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#C8A96A]" />
                  <span>{propertiesClosed}+ Properties Delivered</span>
                </div>
                <span className="text-[#444444] hidden sm:inline">|</span>
              </>
            )}
            {happyFamilies && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C8A96A]" />
                <span>{happyFamilies}+ Families Assisted</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
