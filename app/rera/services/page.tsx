import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import prisma from '@/lib/prisma';
import ReraHomeMotion from '@/components/rera/ReraHomeMotion';

interface SerializedService {
  id: string;
  slug: string | null;
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

    const services: SerializedService[] = servicesRaw
      .filter((service) => !/loan/i.test(`${service.title} ${service.slug ?? ''}`))
      .map((service) => ({
      id: service.id,
      slug: service.slug,
      title: service.title,
      description: service.description,
      iconKey: service.iconKey ?? null,
      highlights: service.highlights ?? [],
    }));

    const loanPartnerLogos = servicesRaw
      .filter((service) => /loan/i.test(`${service.title} ${service.slug ?? ''}`))
      .flatMap((service) => Array.isArray(service.contentImages)
        ? service.contentImages.flatMap((entry) => {
            if (!entry || typeof entry !== 'object' || !('placement' in entry) || entry.placement !== 'loan-partner' || !('url' in entry) || typeof entry.url !== 'string' || !entry.url.startsWith('https://res.cloudinary.com/')) return [];
            return [{ url: entry.url, alt: 'alt' in entry && typeof entry.alt === 'string' ? entry.alt : service.title }];
          })
        : []);

    return { settings, services, loanPartnerLogos };
  } catch (error) {
    console.error('Could not load RERA services', error);
    return { settings: null, services: [] as SerializedService[], loanPartnerLogos: [] as { url: string; alt: string }[] };
  }
}

function getServiceIcon(iconKey: string | null) {
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
    case 'key':
    case 'keyround':
      return KeyRound;
    default:
      return Building2;
  }
}

export default async function ServicesPage() {
  const { settings, services, loanPartnerLogos } = await getServicesData();
  const phone = settings?.phone?.trim() ?? '';
  const whatsapp = settings?.whatsapp?.trim() ?? '';
  const phoneForLink = phone.replace(/[^\d+]/g, '');
  const whatsappForLink = whatsapp.replace(/\D/g, '');

  return (
    <ReraHomeMotion>
    <div className="w-full bg-[#F8F5F1] text-[#1C1C1C]">
      <section aria-labelledby="rera-services-title" className="relative isolate flex min-h-[260px] items-end overflow-hidden bg-[#1C1C1C] sm:min-h-[320px] lg:min-h-[370px]">
        <Image
          src="/arnav/images/slider/slide2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#171717]/90 via-[#171717]/70 to-[#171717]/25" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-24 sm:px-8 sm:pb-12 lg:pb-14">
          <h1 id="rera-services-title" className="font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Our Services
          </h1>
          <nav aria-label="Breadcrumb" className="mt-4 text-sm text-white/85">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href={reraPath('/')} className="transition-colors hover:text-[#FECC00]">Home</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li aria-current="page" className="text-white">Services</li>
            </ol>
          </nav>
        </div>
      </section>

      <section aria-labelledby="services-intro-title" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#990000]">REALSPACE</p>
          <h2 id="services-intro-title" className="mt-2 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
            Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5D5852] sm:text-base sm:leading-8">
            Explore the services currently published by REALSPACE. Contact us with an enquiry about a service.
          </p>
        </div>

        {services.length > 0 ? (
          <div className="rera-motion-grid mt-9 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-7">
            {services.map((service, index) => {
              const Icon = getServiceIcon(service.iconKey);
              const enquiryHref = reraPath(`/contact?service=${encodeURIComponent(service.title)}`);
              const detailHref = service.slug ? reraPath(`/services/${service.slug}`) : null;

              return (
                <article
                  key={service.id}
                  className="rera-motion-card group flex min-w-0 flex-col border border-[#E6DED3] bg-white p-5 shadow-[0_7px_24px_rgba(28,28,28,.04)] transition duration-300 hover:-translate-y-1 hover:border-[#C8A96A] hover:shadow-[0_18px_42px_rgba(28,28,28,.12)]"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#F4EFE8] text-[#990000] transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[#FECC00] group-hover:text-[#1C1C1C] sm:h-14 sm:w-14">
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <span aria-hidden="true" className="shrink-0 font-heading text-2xl font-semibold text-[#D9D1C6]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-semibold leading-snug transition-colors group-hover:text-[#990000] sm:text-2xl">
                    {detailHref ? <Link href={detailHref} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#990000]">{service.title}</Link> : service.title}
                  </h3>
                  <p className="mt-3 flex-1 break-words text-sm leading-6 text-[#625D57]">
                    {service.description}
                  </p>

                  {service.highlights.length > 0 && (
                    <div className="mt-5 border-t border-[#EEE9E2] pt-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[.15em] text-[#716B64]">Highlights</h4>
                      <ul className="mt-3 space-y-2.5">
                        {service.highlights.map((highlight, highlightIndex) => (
                          <li key={`${service.id}-${highlightIndex}`} className="flex items-start gap-2.5 text-xs leading-5 text-[#4F4A44] sm:text-sm">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#990000]" />
                            <span className="break-words">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 border-t border-[#EEE9E2] pt-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {detailHref && (
                        <Link
                          href={detailHref}
                          className="realspace-cta min-h-11 w-full flex-1 px-4 py-3 text-[11px] font-bold uppercase tracking-[.12em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d2253]"
                        >
                          View Details
                        </Link>
                      )}
                      <Link
                        href={enquiryHref}
                        className="realspace-cta min-h-11 w-full flex-1 px-4 py-3 text-[11px] font-bold uppercase tracking-[.12em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d2253]"
                      >
                        Enquire
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto mt-9 max-w-2xl border border-[#E6DED3] bg-white px-5 py-10 text-center sm:mt-12 sm:px-8">
            <p className="font-heading text-xl font-semibold">No published services are available yet.</p>
            <p className="mt-2 text-sm leading-6 text-[#625D57]">Please contact REALSPACE for enquiries.</p>
            <Link href={reraPath('/contact')} className="realspace-cta mt-5 min-h-11 px-5 py-3 text-xs font-bold uppercase tracking-wider">
              Contact Us
            </Link>
          </div>
        )}
      </section>

      {loanPartnerLogos.length > 0 && (
        <section aria-label="Home loan partners" className="relative isolate mb-10 w-full overflow-hidden bg-[#102A56] py-5 sm:mb-14 sm:py-6">
          <Image src="/arnav/images/accommodation/accommodation-bg.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#102A56]/85" />
          <h2 className="relative mb-4 text-center font-heading text-sm font-semibold uppercase tracking-[0.18em] text-white sm:text-base">Home Loan Partners</h2>
          <ul className="relative mx-auto grid w-full max-w-5xl grid-cols-2 items-center justify-items-center gap-4 px-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {loanPartnerLogos.map((logo, index) => (
              <li key={`${logo.url}-${index}`} className="flex w-full items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-white/90 bg-white p-2 shadow-lg sm:h-24 sm:w-24">
                  <Image src={logo.url} alt={index < loanPartnerLogos.length ? logo.alt : ''} width={160} height={100} unoptimized className="max-h-full max-w-full object-contain" />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="services-contact-title" className="border-t border-[#E8E2DA] bg-[#EEE6DD] px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <h2 id="services-contact-title" className="font-heading text-2xl font-semibold sm:text-3xl">Contact REALSPACE</h2>
            <p className="mt-2 text-sm leading-6 text-[#625D57]">Use the contact page or the available contact options to send an enquiry.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            {phone && phoneForLink && (
              <a href={`tel:${phoneForLink}`} className="realspace-cta min-h-11 px-5 py-3 text-xs font-bold uppercase tracking-wider">
                Call {phone}
              </a>
            )}
            {whatsapp && whatsappForLink && (
              <a href={`https://wa.me/${whatsappForLink}?text=${encodeURIComponent('Hello, I would like to enquire about your services.')}`} target="_blank" rel="noopener noreferrer" className="realspace-cta min-h-11 px-5 py-3 text-xs font-bold uppercase tracking-wider">
                WhatsApp
              </a>
            )}
            <Link href={reraPath('/contact')} className="realspace-cta min-h-11 px-5 py-3 text-xs font-bold uppercase tracking-wider">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
    </ReraHomeMotion>
  );
}
