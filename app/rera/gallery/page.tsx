import React from 'react';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import GalleryExplorer from '@/components/rera/gallery/GalleryExplorer';
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

  let itemsRaw: any[] = [];
  try {
    itemsRaw = await prisma.reraGalleryItem.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  } catch {
    itemsRaw = [];
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
      <section className="bg-[#1C1C1C] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-[#C8A96A] mb-3">Our Portfolio</p>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-white">Gallery</h1>
          <p className="mt-4 text-sm text-[#A09890] max-w-xl mx-auto">
            Browse our curated collection of residential and commercial properties, ongoing
            projects, and handover moments in Thane.
          </p>
        </div>
      </section>

      {/* Interactive Gallery */}
      <GalleryExplorer initialItems={items} initialCategory={initialCategory} />
    </>
  );
}
