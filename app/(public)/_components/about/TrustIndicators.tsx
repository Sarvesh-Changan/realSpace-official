import React from "react";

export interface TrustStatItem {
  label: string;
  value: string;
}

export interface TrustIndicatorsProps {
  stats: TrustStatItem[];
}

export function TrustIndicators({ stats }: TrustIndicatorsProps) {
  return (
    <section className="py-12 bg-brand-bgAlt/40 border-y border-brand-bgAlt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 bg-brand-bg rounded-xl shadow-sm border border-brand-bgAlt"
            >
              <div className="text-3xl md:text-4xl font-bold text-brand-red mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-brand-text/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
