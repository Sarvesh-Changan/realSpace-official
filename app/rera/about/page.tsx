import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import prisma from '@/lib/prisma';
import ReraHomeMotion from '@/components/rera/ReraHomeMotion';

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

    const branches: SerializedBranch[] = branchesRaw.map((branch) => ({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      phone: branch.phone ?? null,
      mapUrl: branch.mapUrl ?? null,
    }));

    return { settings, branches };
  } catch {
    return { settings: null, branches: [] as SerializedBranch[] };
  }
}

function cleanText(value: string | null | undefined) {
  return value?.trim() || '';
}

export default async function AboutPage() {
  const { settings, branches } = await getAboutData();
  const aboutTitle = 'Your Trusted Real Estate Partner in Thane & Mulund';
  const aboutParagraphs = [
    'With over 25 years of experience, REALSPACE is a MahaRERA-registered real estate consultancy (Reg. No. A51700012346) helping property owners sell, rent, or lease residential, commercial, and office spaces across Thane and Mulund.',
    'Buyers and tenants can explore curated options matched to their preferred location, configuration, and budget, with transparent guidance from site visits through final documentation.',
  ];

  const founderName = cleanText(settings?.founderName);
  const founderRole = cleanText(settings?.founderRole);
  const founderImage = cleanText(settings?.founderImageUrl);
  // The profile is shown only when the existing CMS has a complete profile; no fallback identity is supplied.
  const hasFounderProfile = Boolean(founderName && founderRole && founderImage);

  const stats = [
    { value: settings?.yearsExperience, label: 'Years of Experience' },
    { value: settings?.propertiesClosed, label: 'Properties Closed' },
    { value: settings?.happyFamilies, label: 'Happy Families' },
  ].filter((stat): stat is { value: number; label: string } =>
    typeof stat.value === 'number' && Number.isFinite(stat.value) && stat.value > 0,
  );

  const areasServed = (settings?.areasServed ?? []).map((area) => area.trim()).filter(Boolean);
  return (
    <ReraHomeMotion>
    <div className="w-full bg-[#F8F5F1] text-[#1C1C1C]">
      <section
        className="relative isolate flex min-h-[260px] items-end overflow-hidden bg-[#102A56] sm:min-h-[320px] lg:min-h-[370px]"
        aria-labelledby="about-page-title"
      >
        <Image
          src="/arnav/images/accommodation/accommodation-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#071A36]/70" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 pt-24 sm:px-8 sm:pb-12 lg:pb-14">
          <h1 id="about-page-title" className="font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl">
            About Us
          </h1>
          <nav aria-label="Breadcrumb" className="mt-4 text-sm text-white/85">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href={reraPath('/')} className="text-white transition-colors hover:text-[#A9CEF5]">Home</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li aria-current="page" className="text-white">About</li>
            </ol>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto w-full max-w-[620px] lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#E6E0D8] shadow-[0_22px_60px_rgba(28,28,28,.14)] sm:aspect-[5/4]">
              <Image
                src={cleanText(settings?.aboutImageUrl) || '/arnav/images/booking/waiter-right2.jpg'}
                alt="Residential property exterior"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                unoptimized={Boolean(settings?.aboutImageUrl && !settings.aboutImageUrl.includes('res.cloudinary.com'))}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 border-b-2 border-r-2 border-[#FECC00]" />
            </div>
          </div>

          <div className="min-w-0 pt-3 lg:order-1 lg:py-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#990000]">About REALSPACE</p>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-[#1C1C1C] sm:text-4xl lg:text-[2.7rem]">
              {aboutTitle}
            </h2>
            {aboutParagraphs.length > 0 ? (
              <div className="mt-6 space-y-4 break-words text-sm leading-7 text-[#55514C] sm:text-base sm:leading-8">
                {aboutParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-7 text-[#55514C] sm:text-base sm:leading-8">
                {settings?.tagline?.trim() || ''}
              </p>
            )}

            {(settings?.phone || settings?.email) && (
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {settings.phone && (
                  <div className="border-l-2 border-[#FECC00] bg-white px-4 py-3 shadow-sm">
                    <span className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#77716A]">Phone</span>
                    <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="mt-1 inline-block break-all text-sm font-semibold text-[#1C1C1C] hover:text-[#990000]">
                      {settings.phone}
                    </a>
                  </div>
                )}
                {settings.email && (
                  <div className="border-l-2 border-[#FECC00] bg-white px-4 py-3 shadow-sm">
                    <span className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#77716A]">Email</span>
                    <a href={`mailto:${settings.email}`} className="mt-1 inline-block break-all text-sm font-semibold text-[#1C1C1C] hover:text-[#990000]">
                      {settings.email}
                    </a>
                  </div>
                )}
              </div>
            )}

            <Link href={reraPath('/contact')} className="mt-7 inline-flex min-h-12 items-center gap-3 bg-[#FECC00] px-6 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#1C1C1C] transition-colors hover:bg-[#990000] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#990000]">
              Contact Us <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {hasFounderProfile && (
        <section className="border-y border-[#E8E2DA] bg-white py-12 sm:py-16">
          <div className="mx-auto grid max-w-5xl items-center gap-8 px-5 sm:px-8 md:grid-cols-[220px_1fr] md:gap-12">
            <div className="relative mx-auto aspect-[4/5] w-48 overflow-hidden bg-[#EEE6DD] md:w-full">
              <Image src={founderImage} alt={founderName} fill sizes="(max-width: 768px) 192px, 220px" className="object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#990000]">Leadership</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold sm:text-3xl">{founderName}</h2>
              <p className="mt-2 text-sm font-medium text-[#77716A]">{founderRole}</p>
            </div>
          </div>
        </section>
      )}

      {stats.length > 0 && (
        <section aria-label="REALSPACE statistics" className="border-y border-[#E8E2DA] bg-white py-8 sm:py-11">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#E8E2DA] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-5 text-center sm:py-2">
                <div className="font-heading text-3xl font-semibold tabular-nums text-[#1C1C1C] sm:text-4xl">{stat.value}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#77716A]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {areasServed.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <MapPin aria-hidden="true" className="mx-auto mb-3 h-6 w-6 text-[#990000]" />
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Areas Served</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {areasServed.map((area) => <span key={area} className="border border-[#E4DDD3] bg-white px-5 py-2.5 text-sm font-semibold tracking-wide text-[#44403B]">{area}</span>)}
          </div>
        </section>
      )}

      {branches.length > 0 && (
        <section className="border-t border-[#E8E2DA] bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#990000]">Visit Us</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold sm:text-3xl">Our Office &amp; Branch Locations</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <article key={branch.id} className="flex min-w-0 flex-col border border-[#E8E2DA] bg-[#FBFAF8] p-5 transition-shadow hover:shadow-lg sm:p-6">
                  <h3 className="font-heading text-lg font-semibold">{branch.name}</h3>
                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[#66615B]">{branch.address}</p>
                  {branch.phone && <a href={`tel:${branch.phone.replace(/[^\d+]/g, '')}`} className="mt-3 text-sm font-medium text-[#1C1C1C] hover:text-[#990000]">{branch.phone}</a>}
                  <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-[#E8E2DA] pt-4">
                    <Link href={reraPath('/contact')} className="text-xs font-bold uppercase tracking-[.1em] text-[#990000] hover:underline">Contact Branch</Link>
                    {branch.mapUrl && (
                      <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.1em] text-[#55514C] hover:text-[#990000]">
                        <MapPin aria-hidden="true" className="h-4 w-4" /> View Map
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#1C1C1C] px-5 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Explore Real Estate with REALSPACE</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">Get in touch with our team or browse the available properties.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href={reraPath('/contact')} className="inline-flex min-h-12 w-full flex-1 items-center justify-center border border-[#A9CEF5] bg-[#A9CEF5] px-6 py-3 text-xs font-bold uppercase tracking-[.1em] text-[#0d2253] shadow-sm transition-colors hover:border-white hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Contact Us</Link>
            <Link href={reraPath('/properties')} className="inline-flex min-h-12 w-full flex-1 items-center justify-center border border-white/70 bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-[.1em] text-white transition-colors hover:border-[#A9CEF5] hover:bg-[#1c3b73] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Browse Properties</Link>
          </div>
        </div>
      </section>
    </div>
    </ReraHomeMotion>
  );
}
