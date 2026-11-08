'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';

export interface TestimonialItem {
  id: string;
  authorName: string;
  authorRole?: string | null;
  society?: string | null;
  quote: string;
  rating: number;
}

export interface TestimonialsSectionProps {
  items?: TestimonialItem[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FFFFFF] border-t border-[#E8E2DA] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
            <Star className="w-4 h-4 fill-[#C8A96A] text-[#C8A96A]" />
            Verified Client Experiences
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
            Trusted Client Experiences
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-2">
            Verified feedback from homeowners and clients across Thane developments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((testimonial) => {
            const ratingCount = Math.max(1, Math.min(5, testimonial.rating || 5));
            return (
              <div
                key={testimonial.id}
                className="p-6 bg-[#F8F5F1] border border-[#E8E2DA] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#C8A96A] mb-3">
                    {[...Array(ratingCount)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C8A96A]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#444444] leading-relaxed italic mb-4">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E2DA] flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#1C1C1C] block">{testimonial.authorName}</strong>
                    {testimonial.authorRole && (
                      <span className="text-[#6D6A66] text-[11px]">{testimonial.authorRole}</span>
                    )}
                  </div>
                  {testimonial.society && (
                    <span className="text-[10px] text-[#A39E98] uppercase tracking-wider">
                      {testimonial.society}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href={reraPath('/about')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] hover:text-[#C8A96A] transition-colors"
          >
            <span>Read Full Studio Story &amp; Client Case Studies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

