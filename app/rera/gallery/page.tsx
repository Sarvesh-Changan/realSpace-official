import React from 'react';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import GalleryExplorer from '@/components/rera/gallery/GalleryExplorer';
import Link from 'next/link';
import { reraPath } from '@/lib/rera/routes';
import type {
  GalleryCategoryFilter,
  ReraGalleryDisplayItem,
} from '@/components/rera/gallery/CategoryChips';

export const metadata: Metadata = {
  title: 'Gallery & Portfolio | REALSPACE',
  description:
    'Visual record of residential and commercial properties, ongoing developments, and handover moments in Thane.',
};

interface GalleryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const resolvedParams = await searchParams;

  let itemsRaw: Awaited<ReturnType<typeof prisma.reraGalleryItem.findMany>> = [];
  let loadFailed = false;
  try {
    itemsRaw = await prisma.reraGalleryItem.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  } catch {
    loadFailed = true;
  }

  const items: ReraGalleryDisplayItem[] = itemsRaw.map((it) => ({
    id: it.id,
    title: it.title,
    category: it.category,
    mediaType: it.mediaType,
    url: it.url,
    thumbnailUrl: it.thumbnailUrl ?? null,
    altText: it.title,
  }));

  // Validate the category param against the enum
  const rawCat = String(resolvedParams.category ?? '').toUpperCase();
  const validCategories: GalleryCategoryFilter[] = [
    'RESIDENTIAL',
    'COMMERCIAL',
    'ONGOING',
    'HANDOVER',
    'OTHER',
  ];
  const initialCategory: GalleryCategoryFilter = validCategories.includes(
    rawCat as GalleryCategoryFilter
  )
    ? (rawCat as GalleryCategoryFilter)
    : 'ALL';

  return (
    <>
      {/* Hero banner */}
      <section className="relative isolate overflow-hidden bg-[#1C1C1C] px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-[radial-gradient(ellipse_at_80%_50%,rgba(254,204,0,0.13),transparent_65%)]" />
        <div className="mx-auto max-w-6xl border-l-2 border-[#FECC00] pl-5 sm:pl-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#FECC00]">REALSPACE · RERA</p>
          <h1 className="font-serif text-4xl font-semibold text-white sm:text-5xl">Gallery</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Images and videos shared in the REALSPACE gallery.
          </p>
        </div>
      </section>

      {/* Interactive Gallery */}
      <GalleryExplorer initialItems={items} initialCategory={initialCategory} loadFailed={loadFailed} />

      <section className="border-t border-[#E8E2DA] bg-[#F8F6F2] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#990000]">Get in touch</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#1C1C1C] sm:text-3xl">Have a property enquiry?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6D6A66]">Contact REALSPACE through our RERA enquiry page.</p>
          </div>
          <Link href={reraPath('/contact')} className="inline-flex min-h-12 items-center justify-center bg-[#FECC00] px-6 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#1C1C1C] transition-colors hover:bg-[#990000] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#990000]">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
