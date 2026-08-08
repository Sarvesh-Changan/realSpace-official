"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Star } from "lucide-react";

export interface TestimonialItem {
  id: string;
  quote: string;
  clientName: string;
  clientRole?: string | null;
  rating?: number;
}

export interface TestimonialsProps {
  testimonials: TestimonialItem[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section className="py-24 bg-brand-bgAlt/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Client Testimonials"
          subtitle="Hear from homeowners and businesses who trusted us with their spaces."
          align="center"
        />

        {testimonials.length === 0 ? (
          <div className="py-16 text-center text-brand-text/50 bg-brand-bg rounded-2xl border border-dashed border-brand-bgAlt max-w-xl mx-auto mt-12">
            <p className="text-base font-medium">
              No client testimonials published yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {testimonials.map((item, index) => {
              const ratingCount = item.rating && item.rating > 0 ? item.rating : 5;
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-brand-bg p-8 rounded-2xl shadow-sm border border-brand-bgAlt relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 mb-6 text-brand-yellow">
                      {[...Array(ratingCount)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-brand-text/80 leading-relaxed mb-8 italic">
                      "{item.quote}"
                    </p>
                  </div>
                  <div>
                    <div className="font-bold">{item.clientName}</div>
                    {item.clientRole && (
                      <div className="text-sm text-brand-text/60">
                        {item.clientRole}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
