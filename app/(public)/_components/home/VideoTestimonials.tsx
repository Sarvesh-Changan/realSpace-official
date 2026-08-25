"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Play } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";

export interface VideoTestimonialItem {
  id: string;
  title: string;
  clientName: string;
  location?: string | null;
  slug?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
}

interface VideoTestimonialsProps {
  testimonials: VideoTestimonialItem[];
}

export function VideoTestimonials({ testimonials }: VideoTestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Video Testimonials"
          subtitle="See how REALSPACE helped clients reimagine the way they live and work."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-14">
          {testimonials.map((item, index) => {
            const videoSlug = item.slug || item.id;
            const thumbnail = item.thumbnailUrl || getVideoThumbnailUrl(item.videoUrl, "VIDEO");

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  href={`/testimonials?video=${encodeURIComponent(videoSlug)}`}
                  className="group block overflow-hidden rounded-2xl border border-brand-bgAlt bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-video overflow-hidden bg-brand-bgAlt">
                    <Image
                      src={thumbnail}
                      alt={`${item.title} video testimonial from ${item.clientName}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={thumbnail.includes("res.cloudinary.com") || thumbnail.startsWith("http")}
                    />
                    <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/30" />
                    <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <Play className="ml-1 h-6 w-6 fill-current" />
                      </span>
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="line-clamp-2 text-lg sm:text-xl font-serif font-bold leading-tight text-brand-text transition-colors group-hover:text-brand-red">
                      {item.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
                      <span className="font-semibold text-brand-text">{item.clientName}</span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-brand-red" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 text-center">
          <Link
            href="/testimonials"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-brand-red px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-red/90 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            View More Testimonials
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
