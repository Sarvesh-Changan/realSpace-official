'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Sparkles,
  Briefcase,
  ShieldCheck,
  Calculator,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageCircle,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { servicesData } from '@/data/services';
import { EMICalculator } from '@/components/EMICalculator';
import { companyData } from '@/data/company';

export default function ServicesPage() {
  const openConsultation = (interest: string) => {
    window.dispatchEvent(
      new CustomEvent('open-consultation-modal', {
        detail: { interest },
      })
    );
  };

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Building2':
        return Building2;
      case 'Sparkles':
        return Sparkles;
      case 'Briefcase':
        return Briefcase;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Calculator':
        return Calculator;
      case 'KeyRound':
        return KeyRound;
      default:
        return Building2;
    }
  };

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. Services Hero Banner */}
      <section className="bg-[#1C1C1C] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            <Sparkles className="w-4 h-4" />
            REALSPACE & Arnav Properties · Comprehensive Capabilities
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-3xl mb-6">
            End-to-End Real Estate Advisory & Turnkey Interior Architecture.
          </h1>
          <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            From discovering prime residential and commercial spaces across Thane to complete turnkey interior design execution led by Vijay Chawan. Experience seamless single-window delivery.
          </p>
        </div>
      </section>

      {/* 02. The 6 Core Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
            <Award className="w-4 h-4" />
            Practice Areas
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C]">
            Curated Real Estate & Design Solutions
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-2 leading-relaxed">
            Every service is backed by our MahaRERA compliance mandate (A51700001581) and 18+ years of localized expertise in Thane West and MMR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, idx) => {
            const Icon = getServiceIcon(service.icon);
            return (
              <div
                key={service.id}
                id={service.id === 'service-turnkey-interiors' ? 'interiors' : undefined}
                className="bg-white border border-[#E8E2DA] p-7 flex flex-col justify-between group hover:border-[#C8A96A] transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 bg-[#EEE6DD] text-[#C8A96A] flex items-center justify-center group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#A39E98]">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-[#1C1C1C] mb-1 group-hover:text-[#B78A47] transition-colors">
                    {service.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#C8A96A] uppercase tracking-wider mb-3">
                    {service.subtitle}
                  </div>

                  <p className="text-xs text-[#6D6A66] leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Key Features */}
                  <div className="space-y-2 border-t border-[#E8E2DA] pt-4 mb-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#1C1C1C] mb-2">
                      Key Highlights:
                    </div>
                    {service.keyFeatures.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#444444]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C8A96A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E2DA]">
                  <button
                    onClick={() => openConsultation(`Inquiry for: ${service.title}`)}
                    className="w-full py-2.5 bg-[#F8F5F1] group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C] border border-[#E8E2DA] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <span>Engage Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 03. REALSPACE 4-Stage Turnkey Interior Execution Framework */}
      <section className="bg-[#1C1C1C] text-white py-20 border-y border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-2 font-semibold">
              <Sparkles className="w-4 h-4" />
              REALSPACE Architectural Blueprint
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-normal text-white">
              The 45-Day Turnkey Interior Delivery Process
            </h2>
            <p className="text-xs sm:text-sm text-[#EEE6DD]/80 mt-2 leading-relaxed">
              Precision off-site German engineering combined with master on-site craftsmanship led by Vijay Chawan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Spatial Discovery & 3D Renders',
                desc: 'Detailed architectural measurement, Vastu alignment check, and photorealistic 3D virtual walkthroughs before civil work begins.',
                timeline: 'Days 1 - 7',
              },
              {
                step: '02',
                title: 'Material & Swatch Curation',
                desc: 'Physical tactile selection of Italian marble slabs, smoked oak veneers, architectural metals, and Häfele/Blum hardware at our Lodha Crown suite.',
                timeline: 'Days 8 - 14',
              },
              {
                step: '03',
                title: 'German Joinery Pre-Fabrication',
                desc: 'Automated factory laser precision cutting, edge-banding, and modular cabinet pre-assembly to eliminate on-site dust and delays.',
                timeline: 'Days 15 - 35',
              },
              {
                step: '04',
                title: 'On-Site Assembly & 45-Day Handover',
                desc: 'White-glove installation, MEP concealed wiring connection, deep cleaning, and 10-year warranty document handover.',
                timeline: 'Days 36 - 45',
              },
            ].map((st, idx) => (
              <div
                key={idx}
                className="bg-[#242424] border border-[#3A3A3A] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-[#C8A96A] tracking-wider mb-2">
                    STAGE {st.step}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#A39E98] leading-relaxed mb-4">
                    {st.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#333333] flex items-center justify-between text-xs text-[#C8A96A]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {st.timeline}
                  </span>
                  <span className="text-[10px] text-[#A39E98] uppercase">Guaranteed</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => openConsultation('Turnkey Interior Consultation at Lodha Crown Experience Suite')}
              className="px-7 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <span>Schedule Walkthrough at Lodha Crown Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 04. Embedded EMI Loan Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <EMICalculator />
      </section>

      {/* 05. Quick Assistance Action Strip */}
      <section className="bg-[#EEE6DD] border-t border-[#E8E2DA] py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C] mb-3">
            Have a Complex Real Estate Requirement in Thane?
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6A66] max-w-xl mx-auto mb-6 leading-relaxed">
            Our senior advisors specialize in NRI property transactions, high-value commercial leasing, and multi-apartment interior packages.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`tel:${companyData.phones.primary.replace(/\s+/g, '')}`}
              className="px-6 py-3 bg-[#1C1C1C] text-white hover:bg-[#C8A96A] hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#C8A96A]" />
              <span>Call Founder: {companyData.phones.primary}</span>
            </a>
            <a
              href={`https://wa.me/${companyData.phones.whatsapp}?text=Hi%20Vijay%2C%20I%20have%20an%20advisory%20inquiry%20regarding%20your%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
