import React from "react";
import { type LucideIcon } from "lucide-react";
import { TiltCard } from "./TiltCard";

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <TiltCard
            key={service.id || index}
            maxTilt={0}
            scale={1}
            className="group flex min-h-[126px] flex-col items-center justify-center rounded-xl border border-brand-border bg-brand-bg p-4 text-center transition-colors hover:border-brand-red/30 sm:min-h-[145px] sm:p-5"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-brand-red/20 bg-brand-redMuted/50 text-brand-red transition-colors duration-300 group-hover:bg-brand-red group-hover:text-white sm:mb-4 sm:h-12 sm:w-12">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-base font-bold leading-tight text-brand-text transition-colors group-hover:text-brand-red sm:text-lg">
              {service.title}
            </h3>
          </TiltCard>
        );
      })}
    </div>
  );
}
