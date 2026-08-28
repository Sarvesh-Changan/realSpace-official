"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Play } from "lucide-react";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface VideoTestimonialItem {
  id: string;
  title: string;
  clientName: string;
  location?: string | null;
  slug?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
}

interface VideoTestimonialsProps {
  testimonials: VideoTestimonialItem[];
}

export function VideoTestimonials({ testimonials }: VideoTestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-brand-bg py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center text-center md:mb-16">
          <ScrollReveal direction="up" distance={20}>
            <h2 className="font-serif text-h2 font-semibold tracking-tight text-brand-text">Video Testimonials</h2>
          </ScrollReveal>
          <div className="mt-5 h-1 w-16 rounded-full bg-brand-yellow" />
          <ScrollReveal direction="up" distance={18} delay={0.08}>
            <p className="mt-5 max-w-2xl text-body-large text-brand-text/70">
              See how REALSPACE helped clients reimagine the way they live and work.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-14">
          {testimonials.map((item, index) => {
            const videoSlug = item.slug || item.id;
            const thumbnail = item.imageUrl || item.thumbnailUrl || (item.videoUrl ? getVideoThumbnailUrl(item.videoUrl, "VIDEO") : "/images/placeholder-image.png");
            const testimonialHref = item.videoUrl
              ? `/testimonials?video=${encodeURIComponent(videoSlug)}`
              : "/testimonials";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  href={testimonialHref}
                  className="group block overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/70 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
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
                    {item.videoUrl && (
                      <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-brand-red text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Play className="ml-1 h-6 w-6 fill-current" />
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <ScrollReveal direction="up" distance={16}>
                      <h3 className="line-clamp-2 text-lg font-serif font-bold leading-tight text-brand-text transition-colors group-hover:text-brand-red sm:text-xl">
                        {item.title}
                      </h3>
                    </ScrollReveal>
                    <ScrollReveal direction="up" distance={14} delay={0.06}>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
                        <span className="font-semibold text-brand-text">{item.clientName}</span>
                        {item.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-brand-red" />
                            {item.location}
                          </span>
                        )}
                      </div>
                    </ScrollReveal>
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
