'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Building2,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Users,
} from 'lucide-react';
import { companyData } from '@/data/company';

export default function AboutPage() {
  const openConsultation = (interest: string) => {
    window.dispatchEvent(
      new CustomEvent('open-consultation-modal', {
        detail: { interest },
      })
    );
  };

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. About Hero Section */}
      <section className="bg-[#1C1C1C] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            MahaRERA: {companyData.reraNumber} · Established 2008
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-3xl mb-6">
            Pioneering Transparent Real Estate & Bespoke Living in Thane.
          </h1>
          <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            Combining licensed real estate advisory with architectural interior mastery. Founded by Vijay Chawan to bring international standards of trust, design, and turnkey execution to Thane and Mumbai MMR.
          </p>
        </div>
      </section>

      {/* 02. Founder Story: Vijay Chawan */}
      <section id="founder" className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] w-full border border-[#E8E2DA] shadow-xl overflow-hidden bg-[#EEE6DD]">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80"
                alt="Vijay Chawan - Founder of REALSPACE & Arnav Properties"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white border border-[#E8E2DA] p-5 shadow-lg hidden sm:block max-w-[240px]">
              <div className="font-heading text-2xl font-bold text-[#1C1C1C] tabular-nums">18+</div>
              <div className="text-xs text-[#6D6A66] font-medium leading-snug">
                Years Shaping Homes Across Thane & MMR
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#C8A96A] font-semibold">
              <Award className="w-4 h-4" />
              Leadership Profile
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1C1C]">
              Meet Vijay Chawan
            </h2>
            <div className="text-xs font-semibold text-[#6D6A66] uppercase tracking-wider">
              {companyData.founderTitle} · Founder of REALSPACE & Arnav Properties
            </div>

            <p className="text-sm sm:text-base text-[#444444] leading-relaxed">
              With nearly two decades of on-ground experience in Thane’s evolving skyline, Vijay Chawan recognized an essential missing link in the property landscape: buyers had to navigate fragmented advice between transactional property brokers and disconnected interior contractors.
            </p>

            <p className="text-sm sm:text-base text-[#444444] leading-relaxed">
              Under Vijay’s stewardship, <strong>Arnav Properties</strong> became an institutional-grade MahaRERA registered brokerage (License: <span className="font-mono text-xs font-bold text-[#1C1C1C]">{companyData.reraNumber}</span>), while <strong>REALSPACE</strong> evolved into a dedicated luxury turnkey interior design studio headquartered at Lodha Crown, Majiwada.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white border border-[#E8E2DA]">
                <strong className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider mb-1">
                  Direct Line
                </strong>
                <a
                  href={`tel:${companyData.phones.primary.replace(/\s+/g, '')}`}
                  className="text-sm font-semibold text-[#1C1C1C] hover:text-[#C8A96A] transition-colors"
                >
                  {companyData.phones.primary}
                </a>
              </div>
              <div className="p-4 bg-white border border-[#E8E2DA]">
                <strong className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider mb-1">
                  Personal Email
                </strong>
                <a
                  href={`mailto:${companyData.emails.primary}`}
                  className="text-xs font-semibold text-[#1C1C1C] hover:text-[#C8A96A] transition-colors"
                >
                  {companyData.emails.primary}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => openConsultation('Private Consultation with Vijay Chawan')}
                className="px-6 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <span>Book Direct One-on-One Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 03. MahaRERA Compliance & Trust Framework */}
      <section id="maharera" className="bg-[#EEE6DD] border-y border-[#E8E2DA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-white border border-[#E8E2DA] p-8 md:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C8A96A]">
                  <ShieldCheck className="w-5 h-5" />
                  Statutory MahaRERA Registration
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                  Official Registration No: {companyData.reraNumber}
                </h3>
                <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                  Maharashtra Real Estate Regulatory Authority (MahaRERA) mandates strict compliance for brokers and real estate agents. Arnav Properties is fully registered and compliant. We adhere to rigorous disclosure guidelines, ensuring you receive true pricing, validated carpet areas, approved master plans, and legal title certifications.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                  <a
                    href="https://maharera.mahaonline.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#0088CC] font-semibold hover:underline"
                  >
                    <span>Verify on official MahaRERA Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-[#A39E98]">|</span>
                  <span className="text-[#6D6A66]">Agent Name: Arnav Properties</span>
                  <span className="text-[#A39E98]">|</span>
                  <span className="text-[#6D6A66]">Jurisdiction: Maharashtra</span>
                </div>
              </div>

              <div className="lg:col-span-4 p-6 bg-[#F8F5F1] border border-[#E8E2DA] text-center space-y-3">
                <div className="font-heading text-3xl font-bold text-[#C8A96A] tabular-nums">
                  100%
                </div>
                <div className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">
                  RERA Compliance Guarantee
                </div>
                <p className="text-[11px] text-[#6D6A66] leading-relaxed">
                  Every residential project, floor layout, and commercial unit presented has passed our rigorous legal title and commencement check.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Our 3 Official Office Locations in Thane */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
            <MapPin className="w-4 h-4" />
            Physical Presence Across Thane
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
            Three Strategic Offices Serving You
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-2">
            Visit our design experience studio at Majiwada or our advisory branches at Teen Hath Naka and Castle Mill.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companyData.addresses.map((addr, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E8E2DA] p-6 flex flex-col justify-between hover:border-[#C8A96A] transition-colors"
            >
              <div>
                <div className="w-9 h-9 bg-[#EEE6DD] text-[#C8A96A] flex items-center justify-center font-bold text-sm mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-heading text-lg font-bold text-[#1C1C1C] mb-2">
                  {addr.title}
                </h3>
                <div className="text-xs text-[#6D6A66] space-y-1 mb-4 leading-relaxed">
                  <div>{addr.line1}</div>
                  <div>{addr.line2}</div>
                  <div>{addr.city} - {addr.pin}</div>
                  {addr.landmark && (
                    <div className="text-[#A39E98] text-[11px] italic pt-1">
                      Landmark: {addr.landmark}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E2DA]">
                <button
                  onClick={() => openConsultation(`Visit to ${addr.title}`)}
                  className="w-full py-2 bg-[#F8F5F1] hover:bg-[#C8A96A] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  Schedule Office Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 05. Call to Action */}
      <section className="bg-[#1C1C1C] text-white py-16 border-t border-[#333333]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Experience the REALSPACE & Arnav Properties Difference
          </h2>
          <p className="text-xs sm:text-sm text-[#EEE6DD]/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Whether you are scouting your dream home in Ghodbunder Road, leasing corporate space in Wagle Estate, or seeking a 45-day turnkey interior transformation, Vijay Chawan and the team are at your service.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openConsultation('General Advisory & Visit Booking')}
              className="px-6 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Book Site Visit & Consultation
            </button>
            <Link
              href="/contact"
              className="px-6 py-3.5 border border-[#E8E2DA]/40 hover:border-[#C8A96A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              View Contact & Phone Numbers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
