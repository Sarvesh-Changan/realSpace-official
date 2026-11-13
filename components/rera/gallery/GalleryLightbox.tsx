'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ReraGalleryDisplayItem } from './CategoryChips';

interface GalleryLightboxProps {
  item: ReraGalleryDisplayItem | null;
  items: ReraGalleryDisplayItem[];
  onChange: (item: ReraGalleryDisplayItem) => void;
  onClose: () => void;
}

export default function GalleryLightbox({ item, items, onChange, onClose }: GalleryLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!item) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (items.length > 1 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const currentIndex = items.findIndex((entry) => entry.id === item.id);
        const direction = e.key === 'ArrowRight' ? 1 : -1;
        onChange(items[(currentIndex + direction + items.length) % items.length]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [item, items, onChange, onClose]);

  // Focus the close button on mount for keyboard accessibility
  useEffect(() => {
    if (item) {
      closeButtonRef.current?.focus();
    }
  }, [item]);

  // Focus trapping inside the lightbox
  useEffect(() => {
    if (!item || !contentRef.current) return;
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => !el.hasAttribute('disabled'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [item]);

  if (!item) return null;

  const isVideo = item.mediaType === 'VIDEO';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={item.altText || item.title}
      onClick={onClose}
    >
      <div
        ref={contentRef}
        className="relative flex flex-col items-center max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute -top-10 right-0 flex items-center justify-center w-9 h-9 rounded-full text-white hover:text-[#C8A96A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Media */}
        {isVideo ? (
          <video
            controls
            autoPlay
            className="max-h-[85vh] w-auto max-w-full rounded-md"
            key={item.url}
          >
            <source src={item.url} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="relative max-h-[85vh] w-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.altText || item.title}
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-md"
            />
          </div>
        )}

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => {
                const index = items.findIndex((entry) => entry.id === item.id);
                onChange(items[(index - 1 + items.length) % items.length]);
              }}
              aria-label="Previous gallery image"
              className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={() => {
                const index = items.findIndex((entry) => entry.id === item.id);
                onChange(items[(index + 1) % items.length]);
              }}
              aria-label="Next gallery image"
              className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </>
        )}

        {/* Caption / Title */}
        {item.title && (
          <p className="mt-3 text-sm text-[#C8A96A] text-center max-w-xl">{item.title}</p>
        )}
      </div>
    </div>
  );
}
