"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2, Play } from "lucide-react";
import { ProjectImage } from "../page";
import { getCloudinaryUrl, getVideoThumbnailUrl } from "@/lib/cloudinary";

const FALLBACK_IMAGE_URL =
  "/images/placeholder-image.png";

export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  // Ensure activeIndex is within bounds if images change
  const currentMediaIndex = Math.min(activeIndex, Math.max(0, images.length - 1));
  const activeMedia = images[currentMediaIndex] || images[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, images.length]);

  if (!images || images.length === 0) return null;

  const handleImageError = (id: string, url: string) => {
    console.warn(
      `[ProjectGallery] Failed to load image asset (ID: ${id}, URL: ${url}). Displaying fallback placeholder.`
    );
    setFailedImageIds((prev) => ({ ...prev, [id]: true }));
  };

  const getResolvedSrc = (img: ProjectImage, isThumbnail = false): string => {
    if (failedImageIds[img.id]) {
      return FALLBACK_IMAGE_URL;
    }

    const isVideo =
      img.mediaType === "VIDEO" ||
      img.url?.match(/\.(mp4|mov|webm|ogv|m4v)(\?.*)?$/i);

    if (isVideo) {
      return getVideoThumbnailUrl(img.url, img.mediaType);
    }

    return getCloudinaryUrl(img.url, { width: isThumbnail ? 400 : 1600 });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Main Active Media Viewer */}
      <div
        className="group relative w-full aspect-[4/3] sm:aspect-video md:aspect-[21/9] rounded-xl overflow-hidden bg-neutral-900 shadow-md border border-neutral-200/60"
      >
        {activeMedia?.mediaType === "VIDEO" ||
        activeMedia?.url?.match(/\.(mp4|mov|webm|ogv|m4v)(\?.*)?$/i) ||
        activeMedia?.url?.includes("/video/upload/") ? (
          <video
            key={activeMedia.id}
            src={activeMedia.url}
            controls
            playsInline
            poster={getVideoThumbnailUrl(activeMedia.url, activeMedia.mediaType)}
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full h-full cursor-pointer"
          >
            <Image
              src={getResolvedSrc(activeMedia, false)}
              alt={activeMedia?.altText || "Project main media"}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              onError={() => handleImageError(activeMedia.id, activeMedia.url)}
              unoptimized={!activeMedia?.url?.includes("res.cloudinary.com")}
            />
            {/* Expand Overlay Badge */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/60 backdrop-blur-md text-white text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 opacity-90 sm:opacity-80 sm:group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
            </div>
          </div>
        )}

        {/* Navigation Arrows for Main Viewer if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-sm text-white flex items-center justify-center sm:opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-sm text-white flex items-center justify-center sm:opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation Strip */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
          {images.map((img, idx) => {
            const isActive = idx === currentMediaIndex;
            const isVideo =
              img.mediaType === "VIDEO" ||
              img.url?.match(/\.(mp4|mov|webm|ogv|m4v)(\?.*)?$/i);

            return (
              <button
                key={img.id}
                onClick={() => setActiveIndex(idx)}
                type="button"
                className={`relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-100 border-2 transition-all text-left focus:outline-none ${
                  isActive
                    ? "border-brand-red ring-2 ring-brand-red/30 scale-[1.02]"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-neutral-300"
                }`}
              >
                <Image
                  src={getResolvedSrc(img, true)}
                  alt={img.altText || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 12vw"
                  className="object-cover"
                  onError={() => handleImageError(img.id, img.url)}
                  unoptimized={!img.url?.includes("res.cloudinary.com")}
                />
                {isVideo && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-brand-red/90 text-white flex items-center justify-center">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="text-sm font-medium text-neutral-300">
              {currentMediaIndex + 1} / {images.length} — {activeMedia.altText}
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close Lightbox"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Main View */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            {images.length > 1 && (
              <button
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <div className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center">
              {activeMedia?.mediaType === "VIDEO" ||
              activeMedia?.url?.match(/\.(mp4|mov|webm|ogv|m4v)(\?.*)?$/i) ||
              activeMedia?.url?.includes("/video/upload/") ? (
                <video
                  key={activeMedia.id}
                  src={activeMedia.url}
                  controls
                  autoPlay
                  playsInline
                  poster={getVideoThumbnailUrl(activeMedia.url, activeMedia.mediaType)}
                  className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <Image
                  src={getResolvedSrc(activeMedia, false)}
                  alt={activeMedia.altText || "Fullscreen media view"}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  onError={() => handleImageError(activeMedia.id, activeMedia.url)}
                  unoptimized={!activeMedia?.url?.includes("res.cloudinary.com")}
                />
              )}
            </div>

            {images.length > 1 && (
              <button
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {images.length > 1 && (
            <div className="flex justify-center items-center gap-2 overflow-x-auto py-2 z-10">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(idx)}
                  type="button"
                  className={`relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                    idx === currentMediaIndex
                      ? "border-brand-red opacity-100 scale-105"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={getResolvedSrc(img, true)}
                    alt={img.altText}
                    fill
                    sizes="56px"
                    className="object-cover"
                    onError={() => handleImageError(img.id, img.url)}
                    unoptimized={!img.url?.includes("res.cloudinary.com")}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
