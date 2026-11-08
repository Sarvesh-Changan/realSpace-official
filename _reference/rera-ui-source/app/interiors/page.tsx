'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { InteriorCostEstimator } from '@/components/InteriorCostEstimator';
import { interiorProjectsData, materialSwatchesData } from '@/data/interiors';
import { companyData } from '@/data/company';

export default function InteriorsPage() {
  const openConsultation = (interest: string) => {
    window.dispatchEvent(
      new CustomEvent('open-consultation-modal', {
        detail: { interest },
      })
    );
  };

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. Hero Banner */}
      <section className="bg-[#1C1C1C] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            <Sparkles className="w-4 h-4" />
            REALSPACE Luxury Interior Design Studio · Thane West
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-3xl mb-6">
            Bespoke Interior Architecture by Vijay Chawan.
          </h1>
          <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body mb-8">
            Specializing in high-end residential penthouses, luxury apartments, and executive commercial suites across Thane and Mumbai. Handcrafted Italian marble, German joinery, and a strict 45-day handover guarantee.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wider">
            <button
              onClick={() => openConsultation('Studio Visit at Lodha Crown Experience Suite')}
              className="px-6 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] transition-colors"
            >
              Book Studio Walkthrough
            </button>
            <a
              href="#portfolio"
              className="px-6 py-3.5 border border-[#E8E2DA]/40 hover:border-[#C8A96A] text-white hover:text-[#C8A96A] transition-colors"
            >
              Explore Project Portfolio
            </a>
          </div>
        </div>
      </section>

      {/* 02. Interactive Before & After Transformation Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <BeforeAfterSlider />
      </section>

      {/* 03. Selected Marquee Interior Projects Portfolio */}
      <section id="portfolio" className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-4 border-b border-[#E8E2DA]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
              <Award className="w-4 h-4" />
              Recent Completed Transformations
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C]">
              Executed Living Spaces in Thane
            </h2>
          </div>
          <div className="text-xs text-[#6D6A66]">
            Every project delivered on-time with 10-year structural warranty.
          </div>
        </div>

        <div className="space-y-16">
          {interiorProjectsData.map((project, idx) => (
            <div
              key={project.id}
              className="bg-white border border-[#E8E2DA] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Image Showcase */}
              <div className="lg:col-span-7 relative aspect-[16/10] w-full overflow-hidden bg-[#EEE6DD] border border-[#E8E2DA]">
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#1C1C1C]/90 text-[#C8A96A] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                  {project.society}
                </div>
              </div>

              {/* Project Specs & Narrative */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs font-semibold text-[#6D6A66] uppercase tracking-wider">
                  {project.carpetAreaSqFt} Sq.Ft · {project.timelineDays}-Day Delivery
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#1C1C1C]">
                  {project.title}
                </h3>
                <div className="text-xs text-[#6D6A66] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                  <span>{project.clientLocation}</span>
                </div>

                <p className="text-xs text-[#444444] leading-relaxed">
                  {project.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2 border-t border-[#E8E2DA] pt-3 text-xs">
                  {project.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-[#444444]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C8A96A] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Material tags */}
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-[#A39E98] mb-1.5">
                    Materials Specified:
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {project.materials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-[#F8F5F1] text-[#1C1C1C] border border-[#E8E2DA]"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => openConsultation(`Inquire about ${project.title} style for my home`)}
                    className="w-full py-3 bg-[#1C1C1C] hover:bg-[#C8A96A] text-white hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <span>Request Similar Architectural Design</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 04. Material Swatches Explorer */}
      <section className="bg-[#EEE6DD] border-y border-[#E8E2DA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
              <Layers className="w-4 h-4" />
              Sourced for Connoisseurs
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
              Signature Material Palette
            </h2>
            <p className="text-xs sm:text-sm text-[#6D6A66] mt-1.5 leading-relaxed">
              Touch and evaluate physical slabs and veneers at our Lodha Crown Design Suite.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materialSwatchesData.map((swatch) => (
              <div
                key={swatch.id}
                className="bg-white border border-[#E8E2DA] p-5 flex flex-col justify-between group hover:border-[#C8A96A] transition-colors"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full mb-4 overflow-hidden bg-[#E8E2DA] border border-[#E8E2DA]">
                    <Image
                      src={swatch.imageUrl}
                      alt={swatch.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-2 left-2 bg-[#1C1C1C]/90 text-[#C8A96A] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
                      {swatch.category}
                    </span>
                  </div>

                  <h4 className="font-heading text-base font-bold text-[#1C1C1C] mb-1">
                    {swatch.name}
                  </h4>
                  <div className="text-[11px] text-[#C8A96A] font-semibold mb-2">
                    Origin: {swatch.origin} · {swatch.finish}
                  </div>
                  <p className="text-xs text-[#6D6A66] leading-relaxed mb-4">
                    {swatch.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E2DA] text-[11px] text-[#A39E98] flex items-center justify-between">
                  <span>Available at Lodha Crown</span>
                  <span className="text-[#1C1C1C] font-semibold">Inspect Swatch</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05. Interactive Interior Cost Estimator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <InteriorCostEstimator />
      </section>

      {/* 06. Studio Contact & Experience Center */}
      <section className="bg-[#1C1C1C] text-white py-16 border-t border-[#333333]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
            Visit the REALSPACE Experience Suite
          </h2>
          <p className="text-xs sm:text-sm text-[#EEE6DD]/80 max-w-xl mx-auto mb-6 leading-relaxed">
            Suite W5-1717, Lodha Crown, Majiwada, Thane West 400608. Meet founder Vijay Chawan for a complimentary 3D spatial assessment of your floor plan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`tel:${companyData.phones.primary.replace(/\s+/g, '')}`}
              className="px-6 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Founder: {companyData.phones.primary}</span>
            </a>
            <a
              href={`https://wa.me/${companyData.phones.whatsapp}?text=Hi%20Vijay%2C%20I%20would%20like%20to%20schedule%20an%20interior%20consultation%20at%20Lodha%20Crown.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
