import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, ArrowRight, ArrowUpRight, Sparkles, Building2, Briefcase, KeyRound } from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import prisma from '@/lib/prisma';
import { HeroSection } from '@/components/rera/HeroSection';
import { FAQSection } from '@/components/rera/FAQSection';
import { TestimonialsSection } from '@/components/rera/TestimonialsSection';
import { HomeContactSection } from '@/components/rera/HomeContactSection';
import ReraHomeMotion from '@/components/rera/ReraHomeMotion';

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
    const [settings, featuredPropertiesRaw, newLaunchPropertiesRaw, testimonialsRaw, faqsRaw, servicesRaw, branchRaw, partnersRaw] =
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
        prisma.reraBuilderPartner.findMany({
          where: { isPublished: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }).catch((error) => {
          console.error('Failed to load RERA homepage partners:', error);
          return [];
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
      slug: service.slug,
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
      partners: partnersRaw.map((partner) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description ?? '',
        logoUrl: partner.logoUrl,
      })),
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
      partners: [],
    };
  }
}

interface BhkShowcaseItem {
  label: string;
  image: string;
  price: string | null;
}

function BhkShowcaseTile({
  item,
  className,
  sizes,
}: {
  item: BhkShowcaseItem;
  className: string;
  sizes: string;
}) {
  const contactHref = reraPath(`/contact?configuration=${encodeURIComponent(item.label)}`);

  return (
    <div className={`group relative min-h-[240px] overflow-hidden ${className}`}>
      <Link href={reraPath('/properties')} aria-label={`Browse ${item.label} properties`} className="absolute inset-0 z-0">
        <Image
          src={item.image}
          alt={`${item.label} floor plan`}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[#36A8D2]/85 opacity-100 transition-opacity duration-300 md:bg-[#36A8D2]/90 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/65 to-transparent px-5 pb-5 pt-16 text-center font-heading text-xl font-semibold text-white transition-opacity duration-200 md:group-hover:opacity-0 md:group-focus-within:opacity-0">
        {item.label} FLAT
      </span>
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-4 text-center text-white opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <h3 className="font-heading text-2xl font-bold uppercase sm:text-3xl">{item.label} Flat</h3>
        {item.price && (
          <p className="text-xs font-medium uppercase tracking-wider sm:text-sm">
            Starts from <strong className="text-xl sm:text-2xl">{item.price}</strong>
          </p>
        )}
        <Link
          href={contactHref}
          className="group/book pointer-events-auto relative inline-flex min-h-12 items-stretch overflow-hidden border border-[#102A56] bg-transparent text-xs font-semibold uppercase tracking-wider text-[#102A56] transition-colors duration-300 hover:bg-[#102A56] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="relative z-10 flex items-center px-6">Book Now</span>
          <span aria-hidden="true" className="relative z-10 flex w-14 items-center justify-center bg-[#102A56] text-white transition-colors duration-300 group-hover/book:bg-white group-hover/book:text-[#102A56]">
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/book:translate-x-1" />
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[-25%] z-0 w-8 -skew-x-[22deg] bg-[#36A8D2]/60 opacity-0 transition-all duration-500 group-hover/book:left-[110%] group-hover/book:opacity-100" />
        </Link>
      </div>
    </div>
  );
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
    partners,
  } = await getHomeData();

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
    <ReraHomeMotion>
      {/* Hero Showcase Section */}
      <HeroSection
        heroHeadline={settings?.heroHeadline ?? null}
        heroSubhead={settings?.heroSubhead ?? null}
        heroImageUrl={settings?.heroImageUrl ?? null}
        heroSlides={heroSlides}
        heroSlideInterval={settings?.heroSlideInterval ?? 8}
        yearsExperience={settings?.yearsExperience ?? null}
        propertiesClosed={settings?.propertiesClosed ?? null}
        happyFamilies={settings?.happyFamilies ?? null}
      />

      {/* Welcome Blurb */}
      <section
        data-rera-home-motion-panels
        className="grid min-h-[500px] overflow-hidden bg-white sm:min-h-[560px] lg:grid-cols-[48%_52%]"
        aria-labelledby="rera-home-welcome-title"
      >
        <div className="flex items-center bg-white px-10 py-14 text-center sm:px-16 lg:px-24 xl:px-32">
          <div className="mx-auto w-full max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1769AA]">About REALSPACE</p>
            <h2 id="rera-home-welcome-title" className="mb-5 font-heading text-3xl font-bold uppercase leading-tight text-[#111827] sm:text-4xl">
              {settings?.welcomeTitle?.trim() || 'Welcome to REALSPACE'}
            </h2>
            <div aria-hidden="true" className="mx-auto mb-8 h-[2px] w-36 bg-[#D8D4CE]" />
            <div className="space-y-4 text-justify text-sm leading-7 text-[#555B63] sm:text-base">
              {settings?.welcomeBody?.split(/\n\s*\n/).map((para, idx) => <p key={`welcome-${idx}`}>{para.trim()}</p>)}
              <p>Owners of residential, commercial, or office space in Thane can contact REALSPACE about selling, renting, or leasing their property. We help owners explore suitable options and connect with prospective buyers or tenants based on the property details and their requirements.</p>
            </div>
            <Link href={reraPath('/about')} className="group mt-8 inline-flex items-center gap-5 border-2 border-[#102B57] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#102B57] transition-colors hover:bg-[#102B57] hover:text-white">
              More About Us <span className="inline-flex items-center"><ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" /></span>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-full">
          <Image
            src="/arnav/images/welcome/welcome-bg.jpg"
            alt="Modern residential building"
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-right"
          />
        </div>
      </section>

      {services.length > 0 && <section className="bg-white py-16 sm:py-20" aria-labelledby="rera-home-services-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="relative mb-10 flex flex-col items-center gap-5 text-center">
            <h2 id="rera-home-services-title" className="font-sans text-3xl font-semibold uppercase tracking-wide text-[#111827] sm:text-4xl">Our Services</h2>
            <div aria-hidden="true" className="relative h-px w-32 bg-[#D5DCE5]">
              <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#D5DCE5] bg-white" />
            </div>
            <Link href={reraPath('/services')} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] hover:text-[#1769AA] sm:absolute sm:right-0 sm:top-1">All services <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => {
            const Icon = service.iconKey?.toLowerCase().includes('key') ? KeyRound : service.iconKey?.toLowerCase().includes('briefcase') ? Briefcase : Building2;
            return <article key={service.id} className="group flex min-h-[240px] flex-col border border-[#E8E2DA] bg-[#F8F5F1] p-6 transition hover:-translate-y-1 hover:border-[#C8A96A] hover:shadow-lg sm:p-7">
              <div className="mb-5 flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center bg-[#EEE6DD] text-[#9A7539] transition group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C]"><Icon className="h-6 w-6" /></span><Link href={reraPath(`/services/${service.slug}`)} aria-label={`Go to ${service.title}`} className="flex h-10 w-10 items-center justify-center border border-[#E4DDD3] text-[#9A7539] transition-all duration-300 hover:translate-x-1 hover:-translate-y-1 hover:border-[#C8A96A] hover:bg-[#C8A96A] hover:text-[#1C1C1C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A7539]"><ArrowUpRight aria-hidden="true" strokeWidth={3} className="h-6 w-6" /></Link></div>
              <h3 className="font-heading text-xl font-bold text-[#1C1C1C]">{service.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-[#6D6A66]">{service.description}</p>
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
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <h2 className="font-heading text-2xl font-semibold uppercase tracking-[0.08em] text-[#1C1C1C] sm:text-3xl">
              What We Offer
            </h2>
            <div aria-hidden="true" className="mx-auto my-6 flex w-36 items-center justify-center">
              <span className="h-px flex-1 bg-[#D6D0C8]" />
              <span className="mx-2 h-5 w-5 rounded-full border-2 border-[#D6D0C8]" />
              <span className="h-px flex-1 bg-[#D6D0C8]" />
            </div>
            <p className="text-sm leading-7 text-[#6D6A66] sm:text-base">
              Explore available residential property options and configurations. View the details below and contact REALSPACE about a property that suits your requirements.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:grid-rows-2 sm:aspect-[2/1]">
            <BhkShowcaseTile item={oneBhk} className="sm:row-span-2 sm:min-h-0" sizes="(max-width: 640px) 100vw, 33vw" />
            <BhkShowcaseTile item={twoBhk} className="sm:col-span-2 sm:min-h-0" sizes="(max-width: 640px) 100vw, 67vw" />
            <BhkShowcaseTile item={threeBhk} className="sm:col-span-2 sm:min-h-0" sizes="(max-width: 640px) 100vw, 67vw" />
          </div>
        </section>
      )}

      {/* 04. Client Reviews & Proof */}
      <TestimonialsSection items={testimonials} />

      {/* Gallery carousel hidden from the homepage; the standalone RERA gallery remains available. */}

      {/* Callback Strip */}

      <HomeContactSection
        settings={{ address: settings?.address ?? null, phone: settings?.phone ?? null, email: settings?.email ?? null }}
        branch={branch ? { ...branch, phone: branch.phone ?? null, mapUrl: branch.mapUrl ?? null } : null}
      />

      {/* 05. Frequently Asked Questions Accordion */}
      <FAQSection items={faqs} />

      {partners.length > 0 && (
        <section className="relative overflow-hidden bg-[#102A56] px-4 py-16 sm:px-8 sm:py-20">
          {heroSlides[0]?.imageUrl && <Image src={heroSlides[0].imageUrl} alt="" fill sizes="100vw" className="object-cover" aria-hidden="true" />}
          <div aria-hidden="true" className="absolute inset-0 bg-[#102A56]/90" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
              <h2 className="font-heading text-2xl font-semibold uppercase tracking-[0.08em] text-white sm:text-3xl">Partners</h2>
              <div aria-hidden="true" className="mx-auto mt-6 flex w-36 items-center justify-center">
                <span className="h-px flex-1 bg-white/70" />
                <span className="mx-2 h-5 w-5 rounded-full border-2 border-white/70" />
                <span className="h-px flex-1 bg-white/70" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {partners.map((partner) => (
                <div key={partner.id} className="[perspective:1000px]">
                  <article
                    tabIndex={0}
                    aria-label={`${partner.name}. Hover or focus to view the description.`}
                    className="group relative min-h-[300px] cursor-pointer outline-none [transform-style:preserve-3d] transition-transform duration-700 ease-in-out hover:[transform:rotateY(180deg)] focus:[transform:rotateY(180deg)] focus-visible:ring-2 focus-visible:ring-[#C8A96A] focus-visible:ring-offset-4 focus-visible:ring-offset-[#102A56] sm:min-h-[370px]"
                  >
                    <div className="absolute inset-0 flex flex-col bg-white p-5 text-center [backface-visibility:hidden] sm:p-6">
                      <div className="relative mb-5 flex h-44 items-center justify-center overflow-hidden bg-white sm:h-56">
                        <Image src={partner.logoUrl} alt={`${partner.name} logo`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-3" />
                      </div>
                      <h3 className="mt-auto text-lg font-semibold uppercase leading-tight text-neutral-950">{partner.name}</h3>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
                      <h3 className="text-lg font-semibold uppercase leading-tight text-neutral-950">{partner.name}</h3>
                      {partner.description && <p className="mt-4 text-sm leading-6 text-neutral-600">{partner.description}</p>}
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </ReraHomeMotion>
  );
}
