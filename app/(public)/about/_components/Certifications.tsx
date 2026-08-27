import React from "react";
import Image from "next/image";

export interface CertificationData {
  id: string;
  title: string;
  badgeLabel: string;
  issuingBody: string;
  imageUrl?: string | null;
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
    <section className="w-full border-t border-brand-border bg-brand-cream/50 px-4 py-16 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto max-w-standard">
        <div className="mb-8 flex items-end justify-between gap-6 sm:mb-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-red">Recognition</p>
            <h2 className="font-serif text-3xl font-bold leading-tight text-brand-text sm:text-5xl">Certifications &amp; Credentials</h2>
          </div>
          <div className="hidden h-px w-24 bg-brand-yellow sm:block" />
        </div>
      </div>

      <div className="mx-auto grid max-w-standard grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {certifications.map((cert, idx) => {
          const accentColor = idx % 2 === 0 ? "border-brand-red" : "border-brand-yellow";
          const badgeBg = idx % 2 === 0 ? "bg-brand-red/10 text-brand-red" : "bg-brand-yellow/20 text-brand-text";
          const displayImage = cert.imageUrl && cert.imageUrl.trim() !== "" ? cert.imageUrl : "/images/certifications/cadpro.png";

          return (
            <div
              key={cert.id}
              className={`group relative overflow-hidden border-t-4 ${accentColor} bg-white p-3 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl sm:p-4`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-warmWhite">
                <Image
                  src={displayImage}
                  alt={`${cert.title} certification badge`}
                  fill
                  className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.03] sm:p-8"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized={!displayImage.includes("res.cloudinary.com")}
                />
                <div className="pointer-events-none absolute inset-0 bg-brand-dark/5" />
              </div>

              <div className="flex items-center justify-between gap-3 px-2 pb-2 pt-4 sm:px-3 sm:pb-3">
                <h3 className="font-serif text-base font-bold leading-tight text-brand-text sm:text-lg">{cert.title}</h3>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeBg}`}>{cert.badgeLabel}</span>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
