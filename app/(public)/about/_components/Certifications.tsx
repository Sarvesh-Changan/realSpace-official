import React from "react";
import Image from "next/image";

export interface CertificationData {
  id: string;
  title: string;
  badgeLabel: string;
  issuingBody: string;
  imageUrl?: string | null;
  textureUrl?: string | null;
  certificateUrl?: string | null;
  showCertificateButton?: boolean;
}

interface CertificationsProps {
  certifications: CertificationData[];
}

export const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <section className="relative isolate w-full overflow-hidden border-t border-brand-border px-4 py-10 sm:px-6 sm:py-14 md:py-16">
      <Image src="/images/hero-living-room.png" alt="" fill sizes="100vw" className="-z-20 object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-brand-dark/45" />
      <div className="relative mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
        {certifications.map((cert, idx) => {
          const displayImage = cert.imageUrl && cert.imageUrl.trim() !== "" ? cert.imageUrl : "/images/certifications/cadpro.png";

          return (
            <div
              key={cert.id}
              className="group relative aspect-[1.45/1] overflow-hidden rounded-xl border border-white/45 bg-white/20 shadow-lg backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/30 hover:shadow-xl sm:rounded-2xl"
            >
              {cert.textureUrl && (
                <Image src={cert.textureUrl} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" unoptimized={!cert.textureUrl.includes("res.cloudinary.com")} />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-brand-dark/5 to-brand-dark/65" />
              <div className="absolute inset-x-0 top-[24%] flex justify-center px-6">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-brand-warmWhite/95 p-2 shadow-xl sm:h-20 sm:w-20 sm:p-2.5">
                  <Image src={displayImage} alt={`${cert.title} certification logo`} fill sizes="80px" className="object-contain p-2.5 sm:p-3.5" unoptimized={!displayImage.includes("res.cloudinary.com")} />
                </div>
              </div>
              <div className="absolute inset-x-2 bottom-2 text-center sm:inset-x-3 sm:bottom-3">
                <h3 className="sr-only">{cert.title}</h3>
                <span className="inline-flex max-w-full rounded-full border border-white/75 bg-brand-dark/25 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-white shadow-sm sm:px-3 sm:text-[9px]">{cert.badgeLabel}</span>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
