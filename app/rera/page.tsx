import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, ArrowRight, Sparkles, Building2, Briefcase, KeyRound } from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import prisma from '@/lib/prisma';
import { HeroSection } from '@/components/rera/HeroSection';
import { TrustStatsStrip } from '@/components/rera/TrustStatsStrip';
import { FAQSection } from '@/components/rera/FAQSection';
import { TestimonialsSection } from '@/components/rera/TestimonialsSection';
import { CallbackStrip } from '@/components/rera/CallbackStrip';
import { HomeContactSection } from '@/components/rera/HomeContactSection';

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
    const [settings, featuredPropertiesRaw, newLaunchPropertiesRaw, testimonialsRaw, faqsRaw, servicesRaw, branchRaw] =
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
        prisma.reraService.findMany({
          where: { isPublished: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
        prisma.reraBranch.findFirst({
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, address: true, phone: true, mapUrl: true },
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

    const services = servicesRaw.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      iconKey: service.iconKey,
    }));

    return {
      settings,
      featuredProperties,
      newLaunchProperties,
      testimonials,
      faqs,
      services,
      branch: branchRaw,
    };
  } catch {
    return {
      settings: null,
      featuredProperties: [],
      newLaunchProperties: [],
      testimonials: [],
      faqs: [],
      services: [],
      branch: null,
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
    services,
    branch,
  } = await getHomeData();

  const reraRegNo =
    settings?.reraRegistrationNo && settings.reraRegistrationNo.trim() !== ''
      ? settings.reraRegistrationNo
      : null;

  const heroSlides = (() => {
    if (!settings?.heroSlidesJson) return [];
    try {
      const parsed: unknown = JSON.parse(settings.heroSlidesJson);
      return Array.isArray(parsed)
        ? parsed.filter((slide): slide is { imageUrl: string; heading?: string; subheading?: string; buttonText?: string; slug?: string } =>
            Boolean(slide && typeof slide.imageUrl === 'string' && slide.imageUrl.trim())
          )
        : [];
    } catch {
      return [];
    }
  })();

  const bhkShowcase = [
    settings?.bhk1ImageUrl ? { label: settings.bhk1Type, image: settings.bhk1ImageUrl, price: settings.bhk1Price } : null,
    settings?.bhk2ImageUrl ? { label: settings.bhk2Type, image: settings.bhk2ImageUrl, price: settings.bhk2Price } : null,
    settings?.bhk3ImageUrl ? { label: settings.bhk3Type, image: settings.bhk3ImageUrl, price: settings.bhk3Price } : null,
  ];
  const [oneBhk, twoBhk, threeBhk] = bhkShowcase;

  return (
    <div className="w-full">
      {/* Hero Showcase Section */}
      <HeroSection
        heroHeadline={settings?.heroHeadline ?? null}
        heroSubhead={settings?.heroSubhead ?? null}
        heroImageUrl={settings?.heroImageUrl ?? null}
        heroSlides={heroSlides}
        heroSlideInterval={settings?.heroSlideInterval ?? 8}
        reraRegistrationNo={reraRegNo}
        brokerName="REALSPACE"
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
      {(settings?.welcomeTitle || settings?.welcomeBody || settings?.founderImageUrl) && (
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-20">
          {settings.founderImageUrl && <div className="relative min-h-[280px] overflow-hidden bg-[#EEE6DD] sm:min-h-[380px]">
            <Image src={settings.founderImageUrl} alt={settings.founderName || 'REALSPACE'} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </div>}
          <div className={settings.founderImageUrl ? '' : 'mx-auto max-w-3xl text-center'}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7539]">About REALSPACE</p>
            {settings.welcomeTitle && <h2 className="mb-4 font-heading text-2xl font-bold text-[#1C1C1C] sm:text-3xl">{settings.welcomeTitle}</h2>}
            {settings.welcomeBody && <div className="space-y-4 text-sm leading-7 text-[#6D6A66] sm:text-base">{settings.welcomeBody.split(/\n\s*\n/).map((para, idx) => <p key={idx}>{para.trim()}</p>)}</div>}
            <Link href={reraPath('/about')} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] hover:text-[#9A7539]">Read about us <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      )}

      {services.length > 0 && <section className="bg-white py-16 sm:py-20" aria-labelledby="rera-home-services-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-9 flex flex-col justify-between gap-4 border-b border-[#E8E2DA] pb-5 sm:flex-row sm:items-end">
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7539]">What we do</p><h2 id="rera-home-services-title" className="font-heading text-2xl font-bold text-[#1C1C1C] sm:text-3xl">Our Services</h2></div>
            <Link href={reraPath('/services')} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] hover:text-[#9A7539]">All services <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.map((service, index) => {
            const Icon = service.iconKey?.toLowerCase().includes('key') ? KeyRound : service.iconKey?.toLowerCase().includes('briefcase') ? Briefcase : Building2;
            return <article key={service.id} className="group flex min-h-[240px] flex-col border border-[#E8E2DA] bg-[#F8F5F1] p-6 transition hover:-translate-y-1 hover:border-[#C8A96A] hover:shadow-lg sm:p-7">
              <div className="mb-5 flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center bg-[#EEE6DD] text-[#9A7539] transition group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C]"><Icon className="h-6 w-6" /></span><span className="font-heading text-2xl text-[#D6CEC3]">{String(index + 1).padStart(2, '0')}</span></div>
              <h3 className="font-heading text-xl font-bold text-[#1C1C1C]">{service.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-[#6D6A66]">{service.description}</p>
              <Link href={reraPath('/services')} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] hover:text-[#9A7539]">View service <ArrowRight className="h-4 w-4" /></Link>
            </article>;
          })}</div>
        </div>
      </section>}

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

      {/* 03. BHK Residence Showcase */}
      {oneBhk && twoBhk && threeBhk && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:grid-rows-2 sm:aspect-[2/1]">
            <Link
              href={reraPath('/properties')}
              className="group relative min-h-[260px] overflow-hidden sm:row-span-2 sm:min-h-0"
            >
              <Image
                src={oneBhk.image}
                alt={`${oneBhk.label} floor plan`}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#1C1C1C]/0 transition-colors duration-300 group-hover:bg-[#1C1C1C]/40 group-focus-visible:bg-[#1C1C1C]/40" />
              <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 to-transparent px-5 pb-5 pt-16 text-center font-heading text-xl font-semibold text-white">
                {oneBhk.label} FLAT
                {oneBhk.price && <span className="mt-1 block text-sm font-medium">Starts from {oneBhk.price}</span>}
              </span>
            </Link>

            <Link
              href={reraPath('/properties')}
              className="group relative min-h-[220px] overflow-hidden sm:col-span-2 sm:min-h-0"
            >
              <Image
                src={twoBhk.image}
                alt={`${twoBhk.label} floor plan`}
                fill
                sizes="(max-width: 640px) 100vw, 67vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#1C1C1C]/0 transition-colors duration-300 group-hover:bg-[#1C1C1C]/40 group-focus-visible:bg-[#1C1C1C]/40" />
              <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 to-transparent px-5 pb-5 pt-16 text-center font-heading text-xl font-semibold text-white">
                {twoBhk.label} FLAT
                {twoBhk.price && <span className="mt-1 block text-sm font-medium">Starts from {twoBhk.price}</span>}
              </span>
            </Link>

              <div tabIndex={0} className="group relative min-h-[240px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C8A96A] sm:col-span-2 sm:min-h-0">
              <Image
                src={threeBhk.image}
                alt={`${threeBhk.label} floor plan`}
                fill
                sizes="(max-width: 640px) 100vw, 67vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1C1C1C]/0 px-5 text-center text-white transition-colors duration-300 group-hover:bg-[#1C1C1C]/75 group-focus-within:bg-[#1C1C1C]/75 sm:flex-row sm:gap-8">
                <span className="text-2xl font-bold sm:max-w-32 sm:text-left sm:text-3xl">
                  {threeBhk.label} FLAT
                </span>
                <span className="hidden h-16 border-l-2 border-white/80 sm:block" />
                <div>
                  <p className="text-xs uppercase tracking-wider sm:text-base">
                    {threeBhk.price && <>Starts from <strong className="text-2xl sm:text-3xl">{threeBhk.price}</strong></>}
                  </p>
                  <Link
                    href={reraPath(`/contact?configuration=${encodeURIComponent(threeBhk.label)}`)}
                    className="mt-4 inline-flex items-center gap-4 border border-[#102A56] bg-[#102A56] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#0B1E3D]"
                  >
                    Book Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 04. Client Reviews & Proof */}
      <TestimonialsSection items={testimonials} />

      {/* Gallery carousel hidden from the homepage; the standalone RERA gallery remains available. */}

      {/* Callback Strip */}
      <CallbackStrip />

      <HomeContactSection
        settings={{ address: settings?.address ?? null, phone: settings?.phone ?? null, email: settings?.email ?? null }}
        branch={branch ? { ...branch, phone: branch.phone ?? null, mapUrl: branch.mapUrl ?? null } : null}
      />

      {/* 05. Frequently Asked Questions Accordion */}
      <FAQSection items={faqs} />
    </div>
  );
}
