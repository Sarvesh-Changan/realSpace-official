import React from 'react';
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
  Award,
} from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import prisma from '@/lib/prisma';

interface SerializedService {
  id: string;
  title: string;
  description: string;
  iconKey: string | null;
  highlights: string[];
}

async function getServicesData() {
  try {
    const [settings, servicesRaw] = await Promise.all([
      prisma.reraSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.reraService.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    const services: SerializedService[] = servicesRaw.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      iconKey: s.iconKey ?? null,
      highlights: s.highlights ?? [],
    }));

    return {
      settings,
      services,
    };
  } catch {
    return {
      settings: null,
      services: [],
    };
  }
}

function getServiceIcon(iconKey?: string | null) {
  switch (iconKey?.toLowerCase()) {
    case 'building':
    case 'building2':
      return Building2;
    case 'sparkles':
      return Sparkles;
    case 'briefcase':
      return Briefcase;
    case 'shield':
    case 'shieldcheck':
      return ShieldCheck;
    case 'calculator':
      return Calculator;
    case 'key':
    case 'keyround':
      return KeyRound;
    default:
      return Building2;
  }
}

export default async function ServicesPage() {
  const { settings, services } = await getServicesData();

  const reraRegNo =
    settings?.reraRegistrationNo && settings.reraRegistrationNo.trim() !== ''
      ? settings.reraRegistrationNo
      : null;

  const phone = settings?.phone ?? '';
  const whatsapp = settings?.whatsapp ?? '';
  const phoneClean = phone.replace(/\s+/g, '');

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. Services Hero Banner */}
      <section className="bg-[#1C1C1C] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Comprehensive Real Estate Capabilities</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-3xl mb-6">
            Real Estate Advisory &amp; Property Solutions.
          </h1>
          <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            From discovering prime residential and commercial spaces across Thane to comprehensive
            due diligence and transaction advisory.
          </p>
        </div>
      </section>

      {/* 02. Published Services Grid */}
      {services.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
              <Award className="w-4 h-4" />
              Practice Areas
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C]">
              Curated Real Estate Solutions
            </h2>
            <p className="text-xs sm:text-sm text-[#6D6A66] mt-2 leading-relaxed">
              {reraRegNo ? (
                <>Backed by statutory MahaRERA compliance (Reg. No. {reraRegNo}).</>
              ) : (
                <>Dedicated real estate advisory across Thane West and MMR.</>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = getServiceIcon(service.iconKey);
              return (
                <div
                  key={service.id}
                  className="bg-white border border-[#E8E2DA] p-7 flex flex-col justify-between group hover:border-[#C8A96A] transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 bg-[#EEE6DD] text-[#C8A96A] flex items-center justify-center group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C] transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#A39E98]">
                        {idx < 9 ? `0${idx + 1}` : idx + 1}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl font-bold text-[#1C1C1C] mb-2 group-hover:text-[#B78A47] transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-xs text-[#6D6A66] leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Key Highlights */}
                    {service.highlights.length > 0 && (
                      <div className="space-y-2 border-t border-[#E8E2DA] pt-4 mb-6">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#1C1C1C] mb-2">
                          Key Highlights:
                        </div>
                        {service.highlights.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-[#444444]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C8A96A] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E8E2DA]">
                    <Link
                      href={reraPath(`/contact?service=${encodeURIComponent(service.title)}`)}
                      className="w-full py-2.5 bg-[#F8F5F1] group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C] border border-[#E8E2DA] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <span>Engage Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 03. Assistance Action Strip */}
      <section className="bg-[#EEE6DD] border-t border-[#E8E2DA] py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C] mb-3">
            Have a Real Estate Requirement in Thane?
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6A66] max-w-xl mx-auto mb-6 leading-relaxed">
            Our advisory team assists with residential acquisitions, commercial leasing, and developer
            inventory in Thane.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {phone && (
              <a
                href={`tel:${phoneClean}`}
                className="px-6 py-3 bg-[#1C1C1C] text-white hover:bg-[#C8A96A] hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#C8A96A]" />
                <span>Call: {phone}</span>
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20have%20an%20advisory%20inquiry%20regarding%20your%20services.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            )}
            <Link
              href={reraPath('/contact')}
              className="px-6 py-3 border border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
