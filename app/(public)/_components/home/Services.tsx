"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Sofa,
  PaintBucket,
  Briefcase,
  Ruler,
  Trees,
  Building,
  Sparkles,
} from "lucide-react";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconKey?: string | null;
}

export interface ServicesProps {
  services: ServiceItem[];
}

function getServiceIcon(iconKey?: string | null, index: number = 0) {
  const key = iconKey?.toLowerCase() || "";
  if (key.includes("sofa") || key.includes("interior") || key.includes("home")) {
    return <Sofa className="w-6 h-6 text-brand-red" />;
  }
  if (key.includes("kitchen") || key.includes("paint")) {
    return <PaintBucket className="w-6 h-6 text-brand-red" />;
  }
  if (key.includes("office") || key.includes("work") || key.includes("briefcase")) {
    return <Briefcase className="w-6 h-6 text-brand-red" />;
  }
  if (key.includes("exterior") || key.includes("facade") || key.includes("building")) {
    return <Building className="w-6 h-6 text-brand-yellow" />;
  }
  if (key.includes("space") || key.includes("plan") || key.includes("ruler")) {
    return <Ruler className="w-6 h-6 text-brand-yellow" />;
  }
  if (key.includes("outdoor") || key.includes("terrace") || key.includes("trees")) {
    return <Trees className="w-6 h-6 text-brand-yellow" />;
  }

  // Fallback pattern
  return index % 2 === 0 ? (
    <Sparkles className="w-6 h-6 text-brand-red" />
  ) : (
    <Building className="w-6 h-6 text-brand-yellow" />
  );
}

export function Services({ services }: ServicesProps) {
  return (
    <section className="border-y border-brand-border/60 bg-brand-bgAlt/45 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Our Services"
          subtitle="Comprehensive design expertise tailored to your specific requirements and budget."
          align="center"
        />

        {services.length === 0 ? (
          <div className="py-12 sm:py-16 text-center text-brand-text/50 bg-brand-bg rounded-2xl border border-dashed border-brand-bgAlt max-w-xl mx-auto px-4">
            <p className="text-sm sm:text-base font-medium">
              No published services available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group rounded-2xl border border-brand-border/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/70 hover:shadow-lg sm:p-7"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-brand-yellow/60 bg-brand-yellow/10 transition-colors duration-300 group-hover:bg-brand-yellow/25 sm:mb-5 sm:h-12 sm:w-12">
                  {getServiceIcon(service.iconKey, index)}
                </div>
                <h3 className="mb-2 font-serif text-h3 font-semibold tracking-tight text-brand-text transition-colors group-hover:text-brand-red">{service.title}</h3>
                <p className="text-sm leading-relaxed text-brand-text/65 sm:text-base">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
