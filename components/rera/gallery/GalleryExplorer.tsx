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
}

export default function GalleryExplorer({
  initialItems,
  initialCategory,
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
        <GalleryGrid items={filteredItems} onOpen={handleOpen} />
      </section>

      {/* Lightbox */}
      <GalleryLightbox item={selectedItem} onClose={handleClose} />
    </>
  );
}

