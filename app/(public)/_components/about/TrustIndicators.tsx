"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Award, Star, MapPin } from "lucide-react";

export interface TrustStatItem {
  label: string;
  value: string;
  icon?: React.ElementType;
}

export interface TrustIndicatorsProps {
  stats: TrustStatItem[];
}

export function TrustIndicators({ stats }: TrustIndicatorsProps) {
  const shouldReduceMotion = usePrefersReducedMotion();

  const iconMap: Record<number, React.ElementType> = {
    0: Award,
    1: Star,
    2: MapPin,
  };

  const getInitial = (index: number) => {
    if (shouldReduceMotion) return { opacity: 1, x: 0, y: 0 };
    if (index === 0) return { opacity: 0, x: -60 };
    if (index === 1) return { opacity: 0, y: 50 };
    return { opacity: 0, x: 60 };
  };

  return (
    <section className="relative isolate py-12 sm:py-16 bg-brand-cream/40 border-y border-brand-border/50 overflow-hidden">
      <div className="mx-auto max-w-standard px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
          {stats.map((stat, index) => {
            const Icon = stat.icon || iconMap[index] || Award;
            const delay = index * 0.15;

            return (
              <motion.div
                key={index}
                initial={getInitial(index)}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: shouldReduceMotion ? 0.01 : 0.6,
                  delay: shouldReduceMotion ? 0 : delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-2xl border border-brand-border/60 shadow-sm hover:shadow-md hover:border-brand-red/30 transition-all duration-300"
              >
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-red mb-2 tracking-tight group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-brand-text/80 uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
