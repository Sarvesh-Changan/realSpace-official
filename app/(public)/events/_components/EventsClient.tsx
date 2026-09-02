"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Calendar,
  Sparkles,
  Film,
  ImageIcon,
} from "lucide-react";

export interface PublicEventMedia {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  sortOrder?: number;
}

export interface PublicEvent {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
  isPublished?: boolean;
  sortOrder?: number;
  media: PublicEventMedia[];
}

export interface PublicEventsProps {
  events: PublicEvent[];
}

export function EventsClient({ events }: PublicEventsProps) {
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);

  const activeMedia = selectedEvent?.media[activeMediaIndex] || null;
  const totalMedia = selectedEvent?.media.length || 0;

  const handleOpenModal = (event: PublicEvent) => {
    setSelectedEvent(event);
    setActiveMediaIndex(0);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
    setActiveMediaIndex(0);
  }, []);

  const handlePrevMedia = useCallback(() => {
    if (!selectedEvent || totalMedia === 0) return;
    setActiveMediaIndex((prev) => (prev === 0 ? totalMedia - 1 : prev - 1));
  }, [selectedEvent, totalMedia]);

  const handleNextMedia = useCallback(() => {
    if (!selectedEvent || totalMedia === 0) return;
    setActiveMediaIndex((prev) => (prev === totalMedia - 1 ? 0 : prev + 1));
  }, [selectedEvent, totalMedia]);

  // Keyboard navigation: Escape to close, ArrowLeft / ArrowRight to navigate media
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEvent) return;
      if (e.key === "Escape") {
        handleCloseModal();
      } else if (e.key === "ArrowLeft") {
        handlePrevMedia();
      } else if (e.key === "ArrowRight") {
        handleNextMedia();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent, handleCloseModal, handlePrevMedia, handleNextMedia]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEvent]);

  return (
    <div className="min-h-screen bg-[#F8F5F1] py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C1C1C]">
            Events & Exhibitions
          </h1>
        </div>

        {/* Event Cards Grid */}
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E2DA] p-12 text-center text-[#6D6A66] max-w-lg mx-auto shadow-sm">
            <Calendar className="w-12 h-12 text-[#C8A96A] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-serif font-bold text-[#1C1C1C]">No Events Available</h3>
            <p className="text-sm text-[#6D6A66] mt-1">
              Check back soon for updates on our latest design exhibitions and events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {events.map((event) => {
              const mediaCount = event.media.length;
              return (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleOpenModal(event)}
                  className="group bg-white rounded-2xl border border-[#E8E2DA] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C8A96A]/60 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Cover Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Media Count Badge */}
                    {mediaCount > 0 && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                        <Film className="w-3.5 h-3.5 text-[#C8A96A]" />
                        <span>{mediaCount} {mediaCount === 1 ? "Item" : "Items"}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Title Box */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white border-t border-[#E8E2DA]/60">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C1C1C] group-hover:text-[#C8A96A] transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal / Pop-up Viewer */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#E8E2DA] overflow-hidden flex flex-col lg:flex-row z-10"
            >
              {/* Close Button (Floating on Mobile) */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black text-white hover:text-white transition-all backdrop-blur-sm cursor-pointer shadow-md lg:hidden"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT SIDE: Media Viewer (Desktop: 65% width, Mobile: Full width top) */}
              <div className="relative w-full lg:w-[65%] bg-black min-h-[260px] sm:min-h-[360px] lg:min-h-[580px] max-h-[55vh] lg:max-h-[85vh] flex items-center justify-center overflow-hidden flex-shrink-0">
                {activeMedia ? (
                  activeMedia.mediaType === "VIDEO" ? (
                    <video
                      key={activeMedia.id || activeMedia.mediaUrl}
                      controls
                      autoPlay
                      src={activeMedia.mediaUrl}
                      className="w-full h-full max-h-[55vh] lg:max-h-[85vh] object-contain"
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center p-2">
                      <Image
                        key={activeMedia.id || activeMedia.mediaUrl}
                        src={activeMedia.mediaUrl}
                        alt={selectedEvent.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 65vw"
                        priority
                      />
                    </div>
                  )
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    <Image
                      src={selectedEvent.coverImageUrl}
                      alt={selectedEvent.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      priority
                    />
                  </div>
                )}

                {/* Arrow Controls on Viewer */}
                {totalMedia > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevMedia}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black text-white backdrop-blur-sm transition-all shadow-md cursor-pointer border border-white/20"
                      aria-label="Previous item"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMedia}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black text-white backdrop-blur-sm transition-all shadow-md cursor-pointer border border-white/20"
                      aria-label="Next item"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* RIGHT SIDE: Title Header & Thumbnail Strip (Desktop: 35% width, Mobile: Bottom stacked) */}
              <div className="w-full lg:w-[35%] bg-white flex flex-col justify-between p-4 sm:p-6 overflow-hidden max-h-[40vh] lg:max-h-[85vh]">
                {/* Header Info */}
                <div className="space-y-2 border-b border-[#E8E2DA] pb-4 pr-8 lg:pr-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#C8A96A] bg-[#C8A96A]/10 px-2.5 py-1 rounded-md">
                      Event Showcase
                    </span>
                    {/* Desktop Close Button */}
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="hidden lg:flex p-1.5 rounded-lg text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1] transition-colors cursor-pointer"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1C1C] line-clamp-2">
                    {selectedEvent.title}
                  </h2>
                  {totalMedia > 0 && (
                    <p className="text-xs text-[#6D6A66] font-medium">
                      Item {activeMediaIndex + 1} of {totalMedia}
                    </p>
                  )}
                </div>

                {/* Thumbnails Section */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
                  <h4 className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">
                    Event Gallery Media
                  </h4>

                  {totalMedia === 0 ? (
                    <div className="p-4 text-center text-xs text-[#6D6A66] bg-[#F8F5F1] rounded-lg">
                      No additional media gallery uploaded for this event.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 lg:grid-cols-3 gap-2.5">
                      {selectedEvent.media.map((item, idx) => {
                        const isActive = idx === activeMediaIndex;
                        return (
                          <button
                            key={item.id || idx}
                            type="button"
                            onClick={() => setActiveMediaIndex(idx)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-neutral-900 group ${
                              isActive
                                ? "border-[#C8A96A] ring-2 ring-[#C8A96A]/30 scale-95"
                                : "border-[#E8E2DA] hover:border-[#C8A96A]/60 opacity-80 hover:opacity-100"
                            }`}
                          >
                            {item.mediaType === "VIDEO" ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-white p-1">
                                <Play className="w-5 h-5 text-[#C8A96A] fill-[#C8A96A]" />
                                <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5 text-amber-300">
                                  Video
                                </span>
                              </div>
                            ) : (
                              <Image
                                src={item.mediaUrl}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="100px"
                              />
                            )}

                            {isActive && (
                              <div className="absolute inset-0 border-2 border-[#C8A96A] rounded-lg pointer-events-none" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Modal Navigation Footer */}
                {totalMedia > 1 && (
                  <div className="pt-3 border-t border-[#E8E2DA] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handlePrevMedia}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-[#F8F5F1] hover:bg-[#EEE6DD] text-[#1C1C1C] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMedia}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-[#1C1C1C] hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
