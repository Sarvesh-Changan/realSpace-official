'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, Award, Building, Users } from 'lucide-react';

export interface HeroSectionProps {
  onOpenConsultation?: () => void;
  onExploreProperties?: () => void;
  heroHeadline?: string | null;
  heroSubhead?: string | null;
  heroImageUrl?: string | null;
  reraRegistrationNo?: string | null;
  brokerName?: string | null;
  founderName?: string | null;
  yearsExperience?: number | string | null;
  happyFamilies?: number | string | null;
  propertiesClosed?: number | string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenConsultation,
  onExploreProperties,
  heroHeadline,
  heroSubhead,
  heroImageUrl,
  reraRegistrationNo,
  brokerName,
  founderName,
  yearsExperience,
  happyFamilies,
  propertiesClosed,
}) => {
  const handleOpenConsultation = () => {
    if (onOpenConsultation) {
      onOpenConsultation();
    } else {
      window.dispatchEvent(
        new CustomEvent('open-consultation-modal', {
          detail: { interest: 'VIP Consultation' },
        })
      );
    }
  };

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

  const headline = heroHeadline?.trim() || 'Find Your Dream Home in Thane';

  return (
    <section className="relative w-full overflow-hidden bg-[#1C1C1C] text-white">
      {/* Background Architectural Scrim & Imagery (Neutral fallback when missing) */}
      <div className="absolute inset-0 z-0">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={headline}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-35 filter brightness-90"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1C] via-[#242424] to-[#141414]" />
        )}
        {/* Subtle radial luxury vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-[#1C1C1C]/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-20 md:py-28 lg:py-32 flex flex-col justify-center min-h-[580px]">
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
          className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-[1.15] max-w-3xl mb-6"
          style={{ textWrap: 'balance' }}
        >
          {headline}
        </h1>

        {/* Narrative Description */}
        {heroSubhead && heroSubhead.trim() !== '' && (
          <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body mb-8">
            {heroSubhead}
          </p>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
          <button
            onClick={handleExploreProperties}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-md group"
          >
            <span>Explore Properties</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={handleOpenConsultation}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#E8E2DA]/40 hover:border-[#C8A96A] text-white hover:text-[#C8A96A] bg-[#1C1C1C]/40 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-[#C8A96A]" />
            <span>Consult {founderName || 'Our Team'}</span>
          </button>
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
