'use client';

import React from 'react';
import { Award, Building, Users } from 'lucide-react';

export interface TrustStatsStripProps {
  yearsExperience?: number | string | null;
  happyFamilies?: number | string | null;
  propertiesClosed?: number | string | null;
}

export const TrustStatsStrip: React.FC<TrustStatsStripProps> = ({
  yearsExperience,
  happyFamilies,
  propertiesClosed,
}) => {
  const stats = [
    yearsExperience
      ? {
          value: `${yearsExperience}+`,
          unit: 'Years in Thane',
          label: 'Real Estate Legacy',
          icon: Award,
        }
      : null,
    propertiesClosed
      ? {
          value: `${propertiesClosed}+`,
          unit: 'Properties',
          label: 'Delivered & Handed Over',
          icon: Building,
        }
      : null,
    happyFamilies
      ? {
          value: `${happyFamilies}+`,
          unit: 'Happy Families',
          label: 'Advised & Assisted',
          icon: Users,
        }
      : null,
  ].filter(Boolean) as {
    value: string;
    unit: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];

  if (stats.length === 0) {
    return null;
  }

  const gridColsClass =
    stats.length === 1
      ? 'grid-cols-1 max-w-sm mx-auto'
      : stats.length === 2
      ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
      : 'grid-cols-1 sm:grid-cols-3';

  return (
    <section className="w-full bg-[#EEE6DD] border-b border-[#E8E2DA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className={`grid ${gridColsClass} gap-6 md:gap-8`}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col justify-center border-l-2 border-[#C8A96A]/60 pl-4 py-1"
              >
                <div className="flex items-baseline gap-1.5 font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C] tabular-nums tracking-tight">
                  <span>{stat.value}</span>
                  <span className="text-xs font-body font-medium text-[#6D6A66] uppercase tracking-wider">
                    {stat.unit}
                  </span>
                </div>
                <div className="text-xs text-[#6D6A66] font-medium mt-1 leading-snug">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
