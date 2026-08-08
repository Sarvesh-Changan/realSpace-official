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
    <section className="py-24 bg-brand-bgAlt/30 border-y border-brand-bgAlt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Our Services"
          subtitle="Comprehensive design expertise tailored to your specific requirements and budget."
          align="center"
        />

        {services.length === 0 ? (
          <div className="py-16 text-center text-brand-text/50 bg-brand-bg rounded-2xl border border-dashed border-brand-bgAlt max-w-xl mx-auto">
            <p className="text-base font-medium">
              No published services available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-brand-bg p-8 rounded-2xl border border-brand-bgAlt hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-brand-bgAlt rounded-full flex items-center justify-center mb-6">
                  {getServiceIcon(service.iconKey, index)}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-brand-text/70 leading-relaxed">
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
