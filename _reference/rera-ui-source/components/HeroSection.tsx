'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, MapPin, Award } from 'lucide-react';
import { companyData } from '@/data/company';

interface HeroSectionProps {
  onOpenConsultation: () => void;
  onExploreProperties: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenConsultation,
  onExploreProperties,
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-[#1C1C1C] text-white">
      {/* Background Architectural Scrim & Imagery */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
          alt="REALSPACE & Arnav Properties Luxury Architecture Thane"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-35 filter brightness-90"
          referrerPolicy="no-referrer"
        />
        {/* Subtle radial luxury vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-[#1C1C1C]/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-20 md:py-28 lg:py-32 flex flex-col justify-center min-h-[620px]">
        {/* Editorial Trust Kicker with Typographic Separator */}
        <div className="inline-flex items-center gap-2.5 text-xs uppercase tracking-widest text-[#C8A96A] mb-5">
          <span className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#C8A96A]" />
            MahaRERA: {companyData.reraNumber}
          </span>
          <span className="text-[#6D6A66]">·</span>
          <span className="text-[#EEE6DD]/80">Thane & Mumbai Prime Real Estate</span>
          <span className="text-[#6D6A66] hidden sm:inline">·</span>
          <span className="text-[#EEE6DD]/80 hidden sm:inline">Turnkey Interiors</span>
        </div>

        {/* Hero Headline */}
        <h1
          className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-[1.15] max-w-3xl mb-6"
          style={{ textWrap: 'balance' }}
        >
          Curated Luxury Living & Bespoke Interior Architecture in Thane.
        </h1>

        {/* Narrative Description */}
        <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body mb-8">
          Arnav Properties and REALSPACE bring together 18+ years of property brokerage
          excellence and turnkey interior design led by <span className="text-white font-semibold">Vijay Chawan</span>.
          Discover vetted residences across Ghodbunder Road, Majiwada, and Teen Hath Naka with end-to-end design execution.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
          <button
            onClick={onExploreProperties}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-md group"
          >
            <span>Explore Vetted Properties</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onOpenConsultation}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#E8E2DA]/40 hover:border-[#C8A96A] text-white hover:text-[#C8A96A] bg-[#1C1C1C]/40 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-[#C8A96A]" />
            <span>Consult Vijay Chawan</span>
          </button>
        </div>

        {/* Quiet Authority Footnote */}
        <div className="mt-12 pt-8 border-t border-[#333333] flex flex-wrap items-center gap-6 text-xs text-[#A39E98]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C8A96A]" />
            <span>18+ Years Serving Thane West & MMR</span>
          </div>
          <span className="text-[#444444] hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C8A96A]" />
            <span>Lodha Crown (Majiwada) & Highway Darshan (Teen Hath Naka)</span>
          </div>
          <span className="text-[#444444] hidden md:inline">|</span>
          <div className="flex items-center gap-2 text-[#C8A96A]">
            <span>Zero Brokerage on Select Developer Bookings</span>
          </div>
        </div>
      </div>
    </section>
  );
};
