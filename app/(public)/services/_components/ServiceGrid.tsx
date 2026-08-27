import React from "react";
import Image from "next/image";
import { type LucideIcon } from "lucide-react";
import { TiltCard } from "./TiltCard";

export interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const SERVICE_IMAGES = [
  "/images/hero-living-room.png",
  "/images/owner_image.jpeg",
];

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
    <div className="space-y-8 sm:space-y-12 md:space-y-16">
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <TiltCard
            key={service.id || index}
            maxTilt={0}
            scale={1}
            className={`grid grid-cols-1 overflow-hidden rounded-2xl border border-brand-border bg-brand-bg group lg:grid-cols-2 ${
              index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div className="relative min-h-[240px] overflow-hidden bg-brand-bgAlt sm:min-h-[300px] lg:min-h-[360px]">
              <Image
                src={SERVICE_IMAGES[index % SERVICE_IMAGES.length]}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/10 via-transparent to-brand-dark/55" />
              <span className="absolute left-5 top-5 text-xs font-bold tracking-[0.25em] text-white/85 sm:left-7 sm:top-7">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-brand-red/20 bg-brand-redMuted/50 text-brand-red transition-colors duration-300 group-hover:bg-brand-red group-hover:text-white sm:mb-8 sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} />
              </div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-red">
                Design service
              </p>
              <h3 className="mb-4 font-serif text-2xl font-bold leading-tight text-brand-text sm:text-3xl lg:text-4xl">
                {service.title}
              </h3>
              <p className="max-w-lg text-sm leading-7 text-brand-muted sm:text-base">
                {service.description}
              </p>
              <div className="mt-7 h-px w-16 bg-brand-yellow transition-all duration-300 group-hover:w-24" />
            </div>
          </TiltCard>
        );
      })}
    </div>
  );
}
