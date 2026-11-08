'use client';

import React from 'react';
import { ShieldCheck, Award, Building, Sparkles, Star } from 'lucide-react';
import { companyData } from '@/data/company';

export const TrustStatsStrip: React.FC = () => {
  const stats = [
    {
      value: `${companyData.experienceYears}+`,
      unit: 'Years in Thane',
      label: 'Real Estate & Interior Legacy',
      icon: Award,
    },
    {
      value: `${companyData.propertiesSold}+`,
      unit: 'Properties',
      label: 'Delivered & Handed Over',
      icon: Building,
    },
    {
      value: '420K+',
      unit: 'Sq.Ft Designed',
      label: 'Turnkey Luxury Interiors',
      icon: Sparkles,
    },
    {
      value: `${companyData.rating.score}`,
      unit: 'out of 5.0',
      label: `${companyData.rating.totalReviews}+ Verified Google Reviews`,
      icon: Star,
    },
  ];

  return (
    <section className="w-full bg-[#EEE6DD] border-b border-[#E8E2DA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
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
