"use client";

import { motion } from "framer-motion";

export function TrustStats() {
  // TODO: Client to confirm actual numbers for 8+ Years, 150+ Projects, 4.5 Rating
  const stats = [
    { value: "8+", label: "Years Experience" },
    { value: "150+", label: "Completed Projects" },
    { value: "4.5★", label: "Client Rating" },
    { value: "Thane", label: "& Mumbai Regions" },
  ];

  return (
    <section className="bg-brand-bg border-y border-brand-bgAlt/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-brand-bgAlt/50 divide-y md:divide-y-0">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="py-8 text-center flex flex-col items-center justify-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-brand-red mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base font-medium text-brand-text/70 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
