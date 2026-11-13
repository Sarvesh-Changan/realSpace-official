'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PropertyGalleryMedia {
  id: string;
  url: string;
  altText?: string | null;
  mediaType: string;
}

interface PropertyImageGalleryProps {
  media: PropertyGalleryMedia[];
  propertyTitle: string;
  coverImageUrl?: string | null;
  bhkLabel?: string | null;
}

export default function PropertyImageGallery({
  media,
  propertyTitle,
  coverImageUrl,
  bhkLabel,
}: PropertyImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = media[activeIndex];
  const hasMultiple = media.length > 1;

  const move = (direction: -1 | 1) => {
    if (!hasMultiple) return;
    setActiveIndex((index) => (index + direction + media.length) % media.length);
  };

  return (
    <div
      className="space-y-4"
      role="group"
      aria-label={`${propertyTitle} image gallery. Use left and right arrow keys to change images.`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div className="relative aspect-[16/10] w-full border border-[#E8E2DA] overflow-hidden bg-[#EEE6DD] shadow-md">
        {current?.mediaType === 'VIDEO' ? (
          <video
            controls
            poster={coverImageUrl || undefined}
            className="w-full h-full object-contain"
            key={current.url}
          >
            <source src={current.url} />
            Your browser does not support the video tag.
          </video>
        ) : current ? (
          <Image
            src={current.url}
            alt={current.altText || propertyTitle}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#A39E98] text-sm">
            {propertyTitle}
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous property image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next property image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {bhkLabel && (
          <div className="absolute top-4 left-4 z-10 bg-[#1C1C1C]/90 backdrop-blur-sm text-[#C8A96A] text-xs font-semibold uppercase tracking-wider px-3 py-1">
            {bhkLabel}
          </div>
        )}
      </div>

      {hasMultiple && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {media.map((entry, index) => (
            <button
              type="button"
              key={entry.id || index}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show property image ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className={`relative aspect-[16/10] border overflow-hidden bg-[#EEE6DD] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] ${
                index === activeIndex ? 'border-[#C8A96A]' : 'border-[#E8E2DA]'
              }`}
            >
              {entry.mediaType === 'VIDEO' ? (
                <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 text-xs font-semibold text-white">
                  VIDEO
                </span>
              ) : (
                <Image
                  src={entry.url}
                  alt={entry.altText || `${propertyTitle} image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
