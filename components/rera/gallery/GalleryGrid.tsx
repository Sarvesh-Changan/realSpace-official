'use client';

import React from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import type { ReraGalleryDisplayItem } from './CategoryChips';

interface GalleryGridProps {
  items: ReraGalleryDisplayItem[];
  onOpen: (item: ReraGalleryDisplayItem) => void;
  emptyMessage: string;
}

export default function GalleryGrid({ items, onOpen, emptyMessage }: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <p className="col-span-full py-16 text-center text-sm text-[#6D6A66]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => {
        const isVideo = item.mediaType === 'VIDEO';
        const thumbSrc = isVideo ? item.thumbnailUrl : item.url;

        return (
          <button
            key={item.id}
            onClick={() => onOpen(item)}
            className="group relative aspect-[4/3] overflow-hidden rounded-md bg-[#EEE6DD] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            aria-label={item.altText || item.title}
          >
            {thumbSrc && (
              <Image
                src={thumbSrc}
                alt={item.altText || item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}

            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
                  <Play className="h-5 w-5 text-white fill-white translate-x-0.5" />
                </div>
              </div>
            )}

            {item.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <p className="text-xs text-white line-clamp-1">{item.title}</p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
