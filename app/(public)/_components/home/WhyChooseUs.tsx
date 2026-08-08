"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function WhyChooseUs() {
  const points = [
    {
      number: "01",
      title: "Space-First Design",
      description:
        "We design around your space's real constraints, not abstract templates. Every beam and corner is accounted for.",
    },
    {
      number: "02",
      title: "Direct Designer Access",
      description:
        "Work directly with the founder and lead designer, ensuring your vision isn't lost in a corporate sales funnel.",
    },
    {
      number: "03",
      title: "Thane Specialists",
      description:
        "Deep familiarity with local apartment layouts including Lodha, Godrej, and Kalpataru-style developments.",
    },
    {
      number: "04",
      title: "Transparent Process",
      description:
        "Full 3D visualization and precise material selection approval before any execution begins.",
    },
  ];

  return (
    <section className="py-24 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Why Choose REALSPACE" align="left" />

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
          {points.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex gap-6"
            >
              <div className="shrink-0">
                <span className="text-5xl font-extrabold text-brand-bgAlt stroke-text">
                  {point.number}
                </span>
                <style jsx>{`
                  .stroke-text {
                    color: transparent;
                    -webkit-text-stroke: 1px rgba(0, 0, 0, 0.1);
                  }
                `}</style>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">{point.title}</h3>
                <p className="text-brand-text/70 leading-relaxed">
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
