import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import prisma from '@/lib/prisma';
import { HeroSection } from '@/components/rera/HeroSection';
import { TrustStatsStrip } from '@/components/rera/TrustStatsStrip';
import { FAQSection } from '@/components/rera/FAQSection';
import { TestimonialsSection } from '@/components/rera/TestimonialsSection';
import { CallbackStrip } from '@/components/rera/CallbackStrip';

interface SerializedProperty {
  id: string;
  slug: string;
  title: string;
  description: string;
  locality: string;
  city: string;
  builderName: string | null;
  projectName: string | null;
  priceLabel: string;
  carpetAreaSqFt: number | null;
  bhkLabel: string | null;
  projectReraNo: string | null;
  heroImage: string | null;
}

interface SerializedNewLaunch {
  id: string;
  slug: string;
  title: string;
  locality: string;
  city: string;
  builderName: string;
  priceLabel: string;
  possession: string | null;
  projectReraNo: string | null;
  heroImage: string | null;
}

async function getHomeData() {
  try {
    const [settings, featuredPropertiesRaw, newLaunchPropertiesRaw, testimonialsRaw, faqsRaw] =
      await Promise.all([
        prisma.reraSettings.findUnique({ where: { id: 'singleton' } }),
        prisma.reraProperty.findMany({
          where: { isPublished: true, isFeatured: true },
          take: 6,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        }),
        prisma.reraProperty.findMany({
          where: { isPublished: true, isNewLaunch: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        }),
        prisma.reraTestimonial.findMany({
          where: { isPublished: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
        prisma.reraFaq.findMany({
          where: { isPublished: true },
          take: 6,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
      ]);

    const featuredProperties: SerializedProperty[] = featuredPropertiesRaw.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description ?? '',
      locality: p.locality,
      city: p.city,
      builderName: p.builderName ?? null,
      projectName: p.projectName ?? null,
      priceLabel: p.priceLabel,
      carpetAreaSqFt: p.carpetAreaSqFt ?? null,
      bhkLabel: p.bhkLabel ?? null,
      projectReraNo: p.projectReraNo ?? null,
      heroImage: p.coverImageUrl || p.images[0]?.url || null,
    }));

    const newLaunchProperties: SerializedNewLaunch[] = newLaunchPropertiesRaw.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      locality: p.locality,
      city: p.city,
      builderName: p.builderName ?? p.projectName ?? 'Premier Builder',
      priceLabel: p.priceLabel,
      possession: p.possession ?? null,
      projectReraNo: p.projectReraNo ?? null,
      heroImage: p.coverImageUrl || p.images[0]?.url || null,
    }));

    const testimonials = testimonialsRaw.map((t) => ({
      id: t.id,
      authorName: t.authorName,
      authorRole: t.authorRole ?? null,
      society: t.society ?? null,
      quote: t.quote,
      rating: t.rating ?? 5,
    }));

    const faqs = faqsRaw.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
    }));

    return {
      settings,
      featuredProperties,
      newLaunchProperties,
      testimonials,
      faqs,
    };
  } catch {
    return {
      settings: null,
      featuredProperties: [],
      newLaunchProperties: [],
      testimonials: [],
      faqs: [],
    };
  }
}

export default async function HomePage() {
  const {
    settings,
    featuredProperties,
    newLaunchProperties,
    testimonials,
    faqs,
  } = await getHomeData();

  const reraRegNo =
    settings?.reraRegistrationNo && settings.reraRegistrationNo.trim() !== ''
      ? settings.reraRegistrationNo
      : null;

  return (
    <div className="w-full">
      {/* Hero Showcase Section */}
      <HeroSection
        heroHeadline={settings?.heroHeadline ?? null}
        heroSubhead={settings?.heroSubhead ?? null}
        heroImageUrl={settings?.heroImageUrl ?? null}
        reraRegistrationNo={reraRegNo}
        brokerName={settings?.brokerName ?? null}
        founderName={settings?.founderName ?? null}
        yearsExperience={settings?.yearsExperience ?? null}
        propertiesClosed={settings?.propertiesClosed ?? null}
        happyFamilies={settings?.happyFamilies ?? null}
      />

      {/* Authority Quantitative Metrics */}
      <TrustStatsStrip
        yearsExperience={settings?.yearsExperience ?? null}
        propertiesClosed={settings?.propertiesClosed ?? null}
        happyFamilies={settings?.happyFamilies ?? null}
      />

      {/* Welcome Blurb */}
      {(settings?.welcomeTitle || settings?.welcomeBody) && (
        <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center">
          {settings.welcomeTitle && (
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C] mb-4">
              {settings.welcomeTitle}
            </h2>
          )}
          {settings.welcomeBody && (
            <div className="text-sm sm:text-base text-[#6D6A66] leading-relaxed space-y-4">
              {settings.welcomeBody.split(/\n\s*\n/).map((para, idx) => (
                <p key={idx}>{para.trim()}</p>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 01. Featured Properties Inventory */}
      {featuredProperties.length > 0 && (
        <section id="featured-inventory" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#E8E2DA]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
                <ShieldCheck className="w-4 h-4" />
                Verified Real Estate Inventory
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                Featured Residences &amp; Commercial Spaces
              </h2>
              <p className="text-xs sm:text-sm text-[#6D6A66] mt-1">
                Hand-picked properties across Thane.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={reraPath('/properties')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1C1C] hover:bg-[#C8A96A] text-white hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>View All Properties</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className="luxury-card flex flex-col group overflow-hidden bg-white border border-[#E8E2DA]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEE6DD]">
                  {property.heroImage ? (
                    <Image
                      src={property.heroImage}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#EEE6DD] text-[#A39E98] text-xs uppercase tracking-wider">
                      {property.locality}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-[#1C1C1C]/85 backdrop-blur-sm text-[#C8A96A] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                    {property.locality}
                  </div>
                  {property.projectReraNo && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#1C1C1C] text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
                      RERA: {property.projectReraNo}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {property.bhkLabel && (
                      <div className="text-[11px] font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                        {property.bhkLabel}
                        {property.carpetAreaSqFt ? ` · ${property.carpetAreaSqFt} Sq.Ft` : ''}
                      </div>
                    )}
                    <Link href={`${reraPath('/properties')}/${property.slug}`}>
                      <h3 className="font-heading text-lg font-bold text-[#1C1C1C] leading-snug group-hover:text-[#B78A47] transition-colors">
                        {property.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-[#6D6A66] mt-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                      <span className="truncate">
                        {property.locality}, {property.city}
                      </span>
                    </div>

                    {property.description && (
                      <p className="text-xs text-[#6D6A66] line-clamp-2 leading-relaxed mb-4">
                        {property.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E8E2DA] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#A39E98]">
                        Pricing
                      </div>
                      <div className="text-sm font-bold text-[#1C1C1C]">
                        {property.priceLabel}
                      </div>
                    </div>

                    <Link
                      href={reraPath(`/contact?property=${encodeURIComponent(property.slug)}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F5F1] group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C] border border-[#E8E2DA] text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                      <span>Inquire</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 02. Flagship Developer / New-Launch Spotlight */}
      {newLaunchProperties.length > 0 && (
        <section className="bg-[#EEE6DD] border-y border-[#E8E2DA] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#E8E2DA]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
                  <Sparkles className="w-4 h-4" />
                  New Launch Spotlight
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                  Premier Developments in Thane
                </h2>
                <p className="text-xs sm:text-sm text-[#6D6A66] mt-1">
                  Newly launched builder developments and flagship projects.
                </p>
              </div>

              <Link
                href={reraPath('/properties')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C1C1C] hover:text-[#C8A96A] uppercase tracking-wider"
              >
                <span>Explore All Projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newLaunchProperties.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border border-[#E8E2DA] p-5 flex flex-col justify-between group hover:border-[#C8A96A] transition-all"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full mb-4 overflow-hidden bg-[#E8E2DA]">
                      {project.heroImage ? (
                        <Image
                          src={project.heroImage}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#EEE6DD] text-[#A39E98] text-xs uppercase tracking-wider">
                          New Launch
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 bg-[#1C1C1C]/90 text-[#C8A96A] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
                        New Launch
                      </span>
                    </div>

                    <div className="text-[10px] uppercase font-bold text-[#6D6A66] tracking-wider">
                      {project.builderName}
                    </div>
                    <Link href={`${reraPath('/properties')}/${project.slug}`}>
                      <h3 className="font-heading text-lg font-bold text-[#1C1C1C] mb-1 group-hover:text-[#B78A47] transition-colors">
                        {project.title}
                      </h3>
                    </Link>
                    <div className="text-xs text-[#6D6A66] mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C8A96A]" />
                      <span className="truncate">
                        {project.locality}, {project.city}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-[#444444] border-t border-[#E8E2DA] pt-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-[#6D6A66]">Starts At:</span>
                        <strong className="text-[#1C1C1C]">{project.priceLabel}</strong>
                      </div>
                      {project.possession && (
                        <div className="flex justify-between">
                          <span className="text-[#6D6A66]">Possession:</span>
                          <span>{project.possession}</span>
                        </div>
                      )}
                      {project.projectReraNo && (
                        <div className="flex justify-between">
                          <span className="text-[#6D6A66]">RERA ID:</span>
                          <span className="font-mono text-[10px] text-[#6D6A66]">
                            {project.projectReraNo}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    href={reraPath(`/contact?property=${encodeURIComponent(project.slug)}`)}
                    className="w-full py-2 bg-[#F8F5F1] group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C] border border-[#E8E2DA] text-xs font-semibold uppercase tracking-wider transition-colors text-center inline-block"
                  >
                    Request Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 03. Interior Design by REALSPACE Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="bg-[#1C1C1C] text-white p-8 md:p-12 lg:p-16 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#C8A96A] mb-3">
                <Sparkles className="w-4 h-4" />
                Interior Design by REALSPACE
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight mb-4">
                Bespoke Interior Architecture by {settings?.founderName || 'Vijay Chawan'}.
              </h2>
              <p className="text-sm sm:text-base text-[#EEE6DD]/90 leading-relaxed font-body mb-6">
                From precision 3D architectural renders to German modular cabinetry and Italian marble execution, REALSPACE transforms bare shells into bespoke luxury living spaces.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-3 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] font-semibold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <span>Visit REALSPACE Interiors</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full border border-[#333333] overflow-hidden bg-[#2A2A2A] flex items-center justify-center">
              <div className="text-center space-y-2 opacity-40">
                <Sparkles className="w-12 h-12 text-[#C8A96A] mx-auto" />
                <p className="text-xs text-[#EEE6DD] uppercase tracking-widest font-semibold">Interior Architecture</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Client Reviews & Proof */}
      <TestimonialsSection items={testimonials} />

      {/* Callback Strip */}
      <CallbackStrip />

      {/* 05. Frequently Asked Questions Accordion */}
      <FAQSection items={faqs} />
    </div>
  );
}
