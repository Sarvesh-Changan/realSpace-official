import React from "react";
import { type LucideIcon } from "lucide-react";

export interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ServiceGrid({ services }: { services: ServiceItem[] }) {
  if (!services || services.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-500 bg-brand-bg border border-dashed border-neutral-200 rounded-2xl">
        <p className="text-base font-medium">
          No published services listed in this section at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <div
            key={service.id || index}
            className="flex flex-col p-6 lg:p-8 bg-brand-bg border border-neutral-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-red-50 text-brand-red flex items-center justify-center rounded-xl mb-6 group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
              <Icon className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-brand-text mb-3">
              {service.title}
            </h3>
            <p className="text-neutral-600 text-sm leading-relaxed flex-1">
              {service.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
