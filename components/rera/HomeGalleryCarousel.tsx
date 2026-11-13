'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ReraGalleryDisplayItem } from './gallery/CategoryChips';

export function HomeGalleryCarousel({ items }: { items: ReraGalleryDisplayItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const move = useCallback((direction: number) => {
    setActiveIndex((current) => (current + direction + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [lightboxOpen, move]);

  if (items.length === 0) return null;
  const visibleItems = Array.from({ length: Math.min(3, items.length) }, (_, offset) => items[(activeIndex + offset) % items.length]);
  const activeItem = items[activeIndex];

  return (
    <section className="rera-home-gallery border-y border-[#E8E2DA] bg-white py-16 sm:py-20" aria-labelledby="rera-gallery-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">REALSPACE Gallery</p>
            <h2 id="rera-gallery-title" className="font-heading text-2xl font-bold text-[#1C1C1C] sm:text-3xl">Spaces &amp; Properties</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => move(-1)} aria-label="Previous gallery images" className="flex h-10 w-10 items-center justify-center border border-[#E8E2DA] transition hover:border-[#C8A96A] hover:bg-[#C8A96A]"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next gallery images" className="flex h-10 w-10 items-center justify-center border border-[#E8E2DA] transition hover:border-[#C8A96A] hover:bg-[#C8A96A]"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <button key={item.id} type="button" onClick={() => { setActiveIndex(items.findIndex(({ id }) => id === item.id)); setLightboxOpen(true); }} className="group relative aspect-[4/3] overflow-hidden bg-[#EEE6DD] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96A]" aria-label={`View ${item.title}`}>
              <Image src={item.url} alt={item.altText || item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-12 text-sm font-medium text-white">{item.title}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-2" aria-label="Gallery position">
          {items.map((item, index) => <button key={item.id} type="button" aria-label={`Show gallery image ${index + 1}`} aria-current={index === activeIndex} onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-[#C8A96A]' : 'w-3 bg-[#D4CEC5]'}`} />)}
        </div>
      </div>
      {lightboxOpen && activeItem && <div role="dialog" aria-modal="true" aria-label={activeItem.title} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightboxOpen(false)}>
        <button type="button" aria-label="Close image" onClick={() => setLightboxOpen(false)} className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"><X /></button>
        <button type="button" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-3 sm:left-8 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"><ChevronLeft /></button>
        <div className="relative h-[78vh] w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
          <Image src={activeItem.url} alt={activeItem.altText || activeItem.title} fill sizes="100vw" className="object-contain" />
          <p className="absolute -bottom-8 inset-x-0 text-center text-sm text-white">{activeItem.title}</p>
        </div>
        <button type="button" aria-label="Next image" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-3 sm:right-8 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"><ChevronRight /></button>
      </div>}
    </section>
  );
}
