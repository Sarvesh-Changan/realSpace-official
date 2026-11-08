'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Building,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
  Star,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { TrustStatsStrip } from '@/components/TrustStatsStrip';
import { QuickSearchFilter } from '@/components/QuickSearchFilter';
import { FilterState } from '@/types';
import { propertiesData } from '@/data/properties';
import { marqueeProjectsData } from '@/data/projects';
import { servicesData } from '@/data/services';
import { testimonialsData } from '@/data/testimonials';
import { companyData } from '@/data/company';
import { FAQSection } from '@/components/FAQSection';

export default function HomePage() {
  // Search Filter State
  const [filter, setFilter] = useState<FilterState>({
    transactionType: 'buy',
    microMarket: 'all',
    configuration: 'all',
    propertyType: 'all',
    budgetRange: [0, 1000000000],
    searchQuery: '',
  });

  const openConsultation = (interest: string) => {
    window.dispatchEvent(
      new CustomEvent('open-consultation-modal', {
        detail: { interest },
      })
    );
  };

  const handleSearchSubmit = () => {
    const el = document.getElementById('featured-inventory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered Properties Computation
  const filteredProperties = useMemo(() => {
    return propertiesData.filter((prop) => {
      if (filter.transactionType !== prop.transactionType) return false;
      if (filter.microMarket !== 'all' && prop.microMarket !== filter.microMarket) return false;
      if (filter.configuration !== 'all' && !prop.configuration.toLowerCase().includes(filter.configuration.toLowerCase())) return false;
      if (prop.priceNumeric < filter.budgetRange[0] || prop.priceNumeric > filter.budgetRange[1]) return false;
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const matchesTitle = prop.title.toLowerCase().includes(query);
        const matchesLocation = prop.location.toLowerCase().includes(query);
        const matchesDev = prop.developer?.toLowerCase().includes(query) ?? false;
        if (!matchesTitle && !matchesLocation && !matchesDev) return false;
      }
      return true;
    });
  }, [filter]);

  return (
    <div className="w-full">
      {/* Hero Showcase Section */}
      <HeroSection
        onOpenConsultation={() => openConsultation('VIP Consultation with Vijay Chawan')}
        onExploreProperties={handleSearchSubmit}
      />

      {/* Authority Quantitative Metrics */}
      <TrustStatsStrip />

      {/* Quick Search Console */}
      <QuickSearchFilter
        filter={filter}
        onFilterChange={setFilter}
        onSearchSubmit={handleSearchSubmit}
        totalResultsCount={filteredProperties.length}
      />

      {/* 01. Featured Properties Inventory */}
      <section id="featured-inventory" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#E8E2DA]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
              <ShieldCheck className="w-4 h-4" />
              Verified Thane Real Estate Inventory
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
              Featured Residences & Commercial Spaces
            </h2>
            <p className="text-xs sm:text-sm text-[#6D6A66] mt-1">
              Hand-picked properties across Ghodbunder Road, Majiwada, and Teen Hath Naka.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1C1C] hover:bg-[#C8A96A] text-white hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.slice(0, 6).map((property) => (
            <div
              key={property.id}
              className="luxury-card flex flex-col group overflow-hidden bg-white border border-[#E8E2DA]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEE6DD]">
                <Image
                  src={property.heroImage}
                  alt={property.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#1C1C1C]/85 backdrop-blur-sm text-[#C8A96A] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                  {property.microMarket}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#1C1C1C] text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
                  RERA: {property.reraId}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                    {property.configuration} · {property.carpetAreaSqFt} Sq.Ft
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C] leading-snug group-hover:text-[#B78A47] transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#6D6A66] mt-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </div>

                  <p className="text-xs text-[#6D6A66] line-clamp-2 leading-relaxed mb-4">
                    {property.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E2DA] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#A39E98]">
                      Pricing
                    </div>
                    <div className="text-sm font-bold text-[#1C1C1C]">
                      {property.priceDisplay}
                    </div>
                  </div>

                  <button
                    onClick={() => openConsultation(`Site Visit: ${property.title}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F5F1] group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C] border border-[#E8E2DA] text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <span>Inquire</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 02. Flagship Developer Projects Banner */}
      <section className="bg-[#EEE6DD] border-y border-[#E8E2DA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#E8E2DA]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
                <Sparkles className="w-4 h-4" />
                Marquee Builder Partnerships
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                Premier Developments in Thane
              </h2>
              <p className="text-xs sm:text-sm text-[#6D6A66] mt-1">
                Institutional channel partner for Godrej Properties, Lodha, ACE Realty & Raymond Realty.
              </p>
            </div>

            <Link
              href="/properties"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C1C1C] hover:text-[#C8A96A] uppercase tracking-wider"
            >
              <span>Explore All Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marqueeProjectsData.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-[#E8E2DA] p-5 flex flex-col justify-between group hover:border-[#C8A96A] transition-all"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full mb-4 overflow-hidden bg-[#E8E2DA]">
                    <Image
                      src={project.heroImage}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {project.badge && (
                      <span className="absolute bottom-2 left-2 bg-[#1C1C1C]/90 text-[#C8A96A] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
                        {project.badge}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] uppercase font-bold text-[#6D6A66] tracking-wider">
                    {project.developer}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C] mb-1">
                    {project.title}
                  </h3>
                  <div className="text-xs text-[#6D6A66] mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C8A96A] shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>

                  <div className="space-y-1 text-xs text-[#444444] border-t border-[#E8E2DA] pt-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#6D6A66]">Starts At:</span>
                      <strong className="text-[#1C1C1C]">{project.startingPrice}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6D6A66]">Possession:</span>
                      <span>{project.possessionDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6D6A66]">RERA ID:</span>
                      <span className="font-mono text-[10px] text-[#6D6A66]">{project.reraId}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openConsultation(`Brochure & Pricing: ${project.title}`)}
                  className="w-full py-2 bg-[#F8F5F1] group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C] border border-[#E8E2DA] text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  Request Brochure
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03. REALSPACE Turnkey Interior Architecture Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="bg-[#1C1C1C] text-white p-8 md:p-12 lg:p-16 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#C8A96A] mb-3">
                <Sparkles className="w-4 h-4" />
                REALSPACE Turnkey Luxury Studio
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight mb-4">
                Bespoke Interior Architecture by Vijay Chawan.
              </h2>
              <p className="text-sm sm:text-base text-[#EEE6DD]/90 leading-relaxed font-body mb-6">
                From precision 3D architectural renders to German modular cabinetry and Italian marble execution, REALSPACE transforms bare shells into bespoke luxury living spaces in 45 days.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
                  <span>45-Day Handover Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
                  <span>10-Year Joinery Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
                  <span>In-House Modular Factory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
                  <span>Experience Suite at Lodha Crown</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/services"
                  className="px-6 py-3 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] font-semibold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <span>Explore Interior Services</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => openConsultation('Interior Design Walkthrough with Vijay Chawan')}
                  className="px-6 py-3 border border-[#E8E2DA]/40 hover:border-[#C8A96A] text-white hover:text-[#C8A96A] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Schedule Studio Walkthrough
                </button>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full border border-[#333333] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
                alt="REALSPACE Interior Architecture Design"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 04. Client Reviews & Quantitative Proof */}
      <section className="bg-[#FFFFFF] border-t border-[#E8E2DA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
              <Star className="w-4 h-4 fill-[#C8A96A] text-[#C8A96A]" />
              Verified Client Experiences
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
              Trusted by 850+ Families and Corporate Leaders in Thane
            </h2>
            <p className="text-xs sm:text-sm text-[#6D6A66] mt-2">
              4.8 out of 5 stars based on 184+ verified Google reviews across Thane developments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsData.slice(0, 3).map((testimonial) => (
              <div
                key={testimonial.id}
                className="p-6 bg-[#F8F5F1] border border-[#E8E2DA] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#C8A96A] mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C8A96A]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#444444] leading-relaxed italic mb-4">
                    &ldquo;{testimonial.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E2DA] flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#1C1C1C] block">{testimonial.author}</strong>
                    <span className="text-[#6D6A66] text-[11px]">{testimonial.role}</span>
                  </div>
                  <span className="text-[10px] text-[#A39E98] uppercase tracking-wider">
                    {testimonial.society}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] hover:text-[#C8A96A] transition-colors"
            >
              <span>Read Full Studio Story & Client Case Studies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 05. Frequently Asked Questions Accordion */}
      <FAQSection />
    </div>
  );
}
