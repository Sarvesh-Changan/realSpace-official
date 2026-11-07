"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Award, Star, MapPin } from "lucide-react";
import { ScrollReveal, type ScrollRevealDirection } from "@/components/ui/ScrollReveal";

export function TrustStats({ compact = false, directional = false }: { compact?: boolean; directional?: boolean }) {
  const shouldReduceMotion = usePrefersReducedMotion();

  const stats = [
    {
      value: "27+",
      label: "Years Experience",
      icon: Award,
      delay: 0,
    },
    {
      value: "5★",
      label: "Client Rating",
      icon: Star,
      delay: 0.15,
    },
    {
      value: "Thane - Mumbai",
      label: "& Navi Mumbai Regions",
      icon: MapPin,
      delay: 0.3,
    },
  ];

  const statsGrid = (
    <div className={`grid grid-cols-1 md:grid-cols-3 ${compact ? "gap-3 sm:gap-4" : "gap-6 sm:gap-8"}`}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const textDirection: ScrollRevealDirection = index === 0 ? "left" : index === 2 ? "right" : "up";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: shouldReduceMotion ? 0.01 : 0.6,
                  delay: shouldReduceMotion ? 0 : stat.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative flex flex-col items-center justify-center bg-white/90 text-center backdrop-blur-md transition-all duration-300 hover:border-brand-red/30 hover:shadow-md ${compact ? "min-h-28 rounded-xl border border-brand-border/50 p-4 sm:min-h-32 sm:p-5" : "rounded-2xl border border-brand-border/60 p-6 sm:p-8 shadow-sm"}`}
              >
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                  <Icon className="w-4 h-4" />
                </div>

                <div className={`font-serif font-bold tracking-tight text-brand-red transition-transform duration-300 group-hover:scale-105 ${compact ? "mb-1 text-2xl sm:text-3xl" : "mb-2 text-3xl sm:text-4xl lg:text-5xl"}`}>
                  {stat.value}
                </div>
                <div className={`font-semibold uppercase tracking-widest text-brand-text/80 ${compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"}`}>
                  {directional ? (
                    <ScrollReveal direction={textDirection} distance={20} delay={stat.delay}>
                      {stat.label}
                    </ScrollReveal>
                  ) : (
                    stat.label
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
  );

  if (compact) return statsGrid;

  return (
    <section className="relative isolate overflow-hidden border-y border-brand-border/50 bg-brand-cream/40 py-12 sm:py-16">
      <div className="mx-auto max-w-standard px-4 sm:px-6 lg:px-8">{statsGrid}</div>
    </section>
  );
}
