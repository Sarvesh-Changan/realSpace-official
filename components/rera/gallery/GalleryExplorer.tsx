'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CategoryChips, {
  type GalleryCategoryFilter,
  type ReraGalleryDisplayItem,
} from './CategoryChips';
import GalleryGrid from './GalleryGrid';
import GalleryLightbox from './GalleryLightbox';
import { reraPath } from '@/lib/rera/routes';

interface GalleryExplorerProps {
  initialItems: ReraGalleryDisplayItem[];
  initialCategory: GalleryCategoryFilter;
  loadFailed: boolean;
}

export default function GalleryExplorer({
  initialItems,
  initialCategory,
  loadFailed,
}: GalleryExplorerProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<GalleryCategoryFilter>(initialCategory);
  const [selectedItem, setSelectedItem] = useState<ReraGalleryDisplayItem | null>(null);

  const filteredItems =
    activeCategory === 'ALL'
      ? initialItems
      : initialItems.filter((item) => item.category === activeCategory);

  const handleCategoryChange = useCallback(
    (cat: GalleryCategoryFilter) => {
      setActiveCategory(cat);
      if (cat === 'ALL') {
        router.replace(reraPath('/gallery'), { scroll: false });
      } else {
        router.replace(reraPath('/gallery') + '?category=' + cat.toLowerCase(), { scroll: false });
      }
    },
    [router]
  );

  const handleOpen = useCallback((item: ReraGalleryDisplayItem) => {
    setSelectedItem(item);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return (
    <>
      {/* Category chips */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <CategoryChips active={activeCategory} onChange={handleCategoryChange} />
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loadFailed ? (
          <div role="alert" className="border border-[#E8E2DA] bg-[#F8F6F2] px-5 py-12 text-center">
            <h2 className="font-serif text-xl font-semibold text-[#1C1C1C]">Gallery unavailable</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6D6A66]">
              We could not load the gallery right now. Please try again later or contact REALSPACE.
            </p>
          </div>
        ) : (
          <GalleryGrid
            items={filteredItems}
            onOpen={handleOpen}
            emptyMessage={initialItems.length === 0
              ? 'There are no published gallery items yet.'
              : 'No items in this category yet.'}
          />
        )}
      </section>

      {/* Lightbox */}
      <GalleryLightbox
        item={selectedItem}
        items={filteredItems}
        onChange={setSelectedItem}
        onClose={handleClose}
      />
    </>
  );
}

