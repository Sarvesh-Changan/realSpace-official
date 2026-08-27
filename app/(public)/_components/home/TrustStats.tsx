"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Award, Star, MapPin } from "lucide-react";

export function TrustStats() {
  const shouldReduceMotion = usePrefersReducedMotion();

  const stats = [
    {
      value: "27+",
      label: "Years Experience",
      icon: Award,
      initial: shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 },
      delay: 0,
    },
    {
      value: "5★",
      label: "Client Rating",
      icon: Star,
      initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 },
      delay: 0.15,
    },
    {
      value: "Thane, Navi Mumbai",
      label: "& Mumbai Regions",
      icon: MapPin,
      initial: shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 },
      delay: 0.3,
    },
  ];

  return (
    <section className="relative isolate py-12 sm:py-16 bg-brand-cream/40 border-y border-brand-border/50 overflow-hidden">
      <div className="mx-auto max-w-standard px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={stat.initial}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: shouldReduceMotion ? 0.01 : 0.6,
                  delay: shouldReduceMotion ? 0 : stat.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-2xl border border-brand-border/60 shadow-sm hover:shadow-md hover:border-brand-red/30 transition-all duration-300 text-center"
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
