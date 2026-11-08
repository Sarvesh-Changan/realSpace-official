import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  MapPin,
  ArrowRight,
  ExternalLink,
  Building,
  Users,
} from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import prisma from '@/lib/prisma';

interface SerializedBranch {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  mapUrl: string | null;
}

async function getAboutData() {
  try {
    const [settings, branchesRaw] = await Promise.all([
      prisma.reraSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.reraBranch.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    const branches: SerializedBranch[] = branchesRaw.map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      phone: b.phone ?? null,
      mapUrl: b.mapUrl ?? null,
    }));

    return {
      settings,
      branches,
    };
  } catch {
    return {
      settings: null,
      branches: [],
    };
  }
}

export default async function AboutPage() {
  const { settings, branches } = await getAboutData();

  const reraRegNo =
    settings?.reraRegistrationNo && settings.reraRegistrationNo.trim() !== ''
      ? settings.reraRegistrationNo
      : null;

  const founderName = settings?.founderName?.trim() || 'Vijay Chawan';
  const founderRole = settings?.founderRole?.trim() || 'Founder & Principal Consultant';
  const founderImg = settings?.founderImageUrl?.trim() || null;

  const aboutTitle =
    settings?.aboutTitle?.trim() ||
    'Pioneering Transparent Real Estate & Bespoke Living in Thane.';

  const aboutBodyParagraphs = settings?.aboutBody
    ? settings.aboutBody.split(/\n\s*\n/).filter((p) => p.trim() !== '')
    : [
        `With nearly two decades of on-ground experience in Thane's evolving skyline, ${founderName} recognized an essential missing link in the property landscape: buyers had to navigate fragmented advice between transactional property brokers and disconnected interior contractors.`,
        `Under ${founderName}'s stewardship, our brokerage was built on statutory transparency and institutional diligence, ensuring every homeowner and commercial client receives end-to-end advisory and verified documentation.`,
      ];

  const areasServed = settings?.areasServed ?? [];
  const verifyUrl = settings?.reraVerifyUrl || 'https://maharera.mahaonline.gov.in';

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. About Hero Section */}
      <section className="bg-[#1C1C1C] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            {reraRegNo ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                MahaRERA: {reraRegNo}
              </>
            ) : (
              <span>Licensed Real Estate Advisory</span>
            )}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-3xl mb-6">
            {aboutTitle}
          </h1>
          <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            Combining licensed real estate advisory with architectural mastery. Directed by{' '}
            {founderName} to bring the highest standards of trust and execution to Thane and Mumbai
            MMR.
          </p>
        </div>
      </section>

      {/* 02. Founder Story */}
      <section id="founder" className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] w-full border border-[#E8E2DA] shadow-xl overflow-hidden bg-[#EEE6DD]">
              {founderImg ? (
                <Image
                  src={founderImg}
                  alt={`${founderName} - ${founderRole}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#A39E98] gap-3">
                  <div className="w-20 h-20 rounded-full bg-[#DDD7CE] flex items-center justify-center text-3xl font-heading font-bold text-[#B0A99F]">
                    {founderName.charAt(0)}
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold">{founderRole}</span>
                </div>
              )}
            </div>
            {settings?.yearsExperience && (
              <div className="absolute -bottom-6 -right-6 bg-white border border-[#E8E2DA] p-5 shadow-lg hidden sm:block max-w-[240px]">
                <div className="font-heading text-2xl font-bold text-[#1C1C1C] tabular-nums">
                  {settings.yearsExperience}+
                </div>
                <div className="text-xs text-[#6D6A66] font-medium leading-snug">
                  Years Advisory Excellence in Thane &amp; MMR
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#C8A96A] font-semibold">
              <Award className="w-4 h-4" />
              Leadership Profile
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1C1C]">
              Meet {founderName}
            </h2>
            <div className="text-xs font-semibold text-[#6D6A66] uppercase tracking-wider">
              {founderRole}
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#444444] leading-relaxed">
              {aboutBodyParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Direct Contact Cards */}
            {(settings?.phone || settings?.email) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {settings?.phone && (
                  <div className="p-4 bg-white border border-[#E8E2DA]">
                    <strong className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider mb-1">
                      Direct Line
                    </strong>
                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                      className="text-sm font-semibold text-[#1C1C1C] hover:text-[#C8A96A] transition-colors"
                    >
                      {settings.phone}
                    </a>
                  </div>
                )}
                {settings?.email && (
                  <div className="p-4 bg-white border border-[#E8E2DA]">
                    <strong className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider mb-1">
                      Email
                    </strong>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-xs font-semibold text-[#1C1C1C] hover:text-[#C8A96A] transition-colors"
                    >
                      {settings.email}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <Link
                href={reraPath('/contact')}
                className="px-6 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <span>Book Direct Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 03. Stats Strip (render only when values are present) */}
      {(settings?.yearsExperience || settings?.propertiesClosed || settings?.happyFamilies) && (
        <section className="bg-white border-y border-[#E8E2DA] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {settings?.yearsExperience && (
                <div className="p-4">
                  <div className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1C1C] tabular-nums">
                    {settings.yearsExperience}+
                  </div>
                  <div className="text-xs text-[#6D6A66] font-medium uppercase tracking-wider mt-1">
                    Years of Advisory Experience
                  </div>
                </div>
              )}
              {settings?.propertiesClosed && (
                <div className="p-4">
                  <div className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1C1C] tabular-nums">
                    {settings.propertiesClosed}+
                  </div>
                  <div className="text-xs text-[#6D6A66] font-medium uppercase tracking-wider mt-1">
                    Properties Delivered &amp; Handed Over
                  </div>
                </div>
              )}
              {settings?.happyFamilies && (
                <div className="p-4">
                  <div className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1C1C] tabular-nums">
                    {settings.happyFamilies}+
                  </div>
                  <div className="text-xs text-[#6D6A66] font-medium uppercase tracking-wider mt-1">
                    Happy Families Assisted
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 04. Statutory MahaRERA Registration Card (ONLY when reraRegistrationNo is set) */}
      {reraRegNo && (
        <section id="maharera" className="bg-[#EEE6DD] border-b border-[#E8E2DA] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="bg-white border border-[#E8E2DA] p-8 md:p-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C8A96A]">
                    <ShieldCheck className="w-5 h-5" />
                    Statutory MahaRERA Registration
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                    Official Registration No: {reraRegNo}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                    Maharashtra Real Estate Regulatory Authority (MahaRERA) mandates strict
                    compliance for brokers and real estate agents. We adhere to rigorous disclosure
                    guidelines, ensuring you receive true pricing, validated carpet areas, approved
                    master plans, and legal title certifications.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                    <a
                      href={verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#0088CC] font-semibold hover:underline"
                    >
                      <span>Verify on official MahaRERA Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {settings?.reraRegisteredName && (
                      <>
                        <span className="text-[#A39E98]">|</span>
                        <span className="text-[#6D6A66]">
                          Registered Name: {settings.reraRegisteredName}
                        </span>
                      </>
                    )}
                    <span className="text-[#A39E98]">|</span>
                    <span className="text-[#6D6A66]">Jurisdiction: Maharashtra</span>
                  </div>
                </div>

                <div className="lg:col-span-4 p-6 bg-[#F8F5F1] border border-[#E8E2DA] text-center space-y-3">
                  <div className="font-heading text-3xl font-bold text-[#C8A96A] tabular-nums">
                    100%
                  </div>
                  <div className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">
                    RERA Compliance Mandate
                  </div>
                  <p className="text-[11px] text-[#6D6A66] leading-relaxed">
                    Every residential project, floor layout, and commercial unit presented has
                    passed statutory legal title checks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 05. Areas Served (render only when areas are specified) */}
      {areasServed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
              <MapPin className="w-4 h-4" />
              Coverage
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
              Areas &amp; Micro-Markets Served
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {areasServed.map((area, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white border border-[#E8E2DA] text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider"
              >
                {area}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 06. Published Branches (render only when rows exist) */}
      {branches.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20 border-t border-[#E8E2DA]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
              <MapPin className="w-4 h-4" />
              Physical Presence
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
              Our Office &amp; Branch Locations
            </h2>
            <p className="text-xs sm:text-sm text-[#6D6A66] mt-2">
              Visit our offices for confidential property consultations and site visit coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b, idx) => (
              <div
                key={b.id}
                className="bg-white border border-[#E8E2DA] p-6 flex flex-col justify-between hover:border-[#C8A96A] transition-colors"
              >
                <div>
                  <div className="w-9 h-9 bg-[#EEE6DD] text-[#C8A96A] flex items-center justify-center font-bold text-sm mb-4">
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C] mb-2">
                    {b.name}
                  </h3>
                  <div className="text-xs text-[#6D6A66] space-y-1 mb-4 leading-relaxed whitespace-pre-line">
                    {b.address}
                  </div>
                  {b.phone && (
                    <div className="text-xs text-[#A39E98] mb-2">
                      <span className="font-medium text-[#1C1C1C]">Phone:</span> {b.phone}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E8E2DA] flex items-center gap-3">
                  <Link
                    href={reraPath('/contact')}
                    className="flex-1 py-2 bg-[#F8F5F1] hover:bg-[#C8A96A] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors text-center inline-block"
                  >
                    Contact Branch
                  </Link>
                  {b.mapUrl && (
                    <a
                      href={b.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-[#E8E2DA] hover:border-[#C8A96A] text-[#6D6A66] hover:text-[#1C1C1C] transition-colors"
                      aria-label={`Open map for ${b.name}`}
                    >
                      <MapPin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 07. Call to Action */}
      <section className="bg-[#1C1C1C] text-white py-16 border-t border-[#333333]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Experience Transparent Real Estate Advisory
          </h2>
          <p className="text-xs sm:text-sm text-[#EEE6DD]/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Whether you are scouting your home in Thane or evaluating commercial investments,{' '}
            {founderName} and our team are at your service.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={reraPath('/contact')}
              className="px-6 py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Book Site Visit &amp; Consultation
            </Link>
            <Link
              href={reraPath('/properties')}
              className="px-6 py-3.5 border border-[#E8E2DA]/40 hover:border-[#C8A96A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
