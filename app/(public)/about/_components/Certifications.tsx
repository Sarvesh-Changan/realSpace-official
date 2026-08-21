import React from "react";
import Image from "next/image";

export interface CertificationData {
    id: string;
    title: string;
    badgeLabel: string;
    issuingBody: string;
    description: string;
    imageUrl?: string | null;
    initials?: string;
}

interface CertificationsProps {
    certifications: CertificationData[];
}

function getInitials(name: string): string {
    if (!name) return "CERT";
    const stopWords = new Set(["of", "and", "the", "for", "in", "on", "at", "to", "a", "an"]);
    const words = name
        .trim()
        .split(/\s+/)
        .filter((w) => !stopWords.has(w.toLowerCase()));

    if (words.length === 1) {
        return words[0].substring(0, 3).toUpperCase();
    }

    return words
        .map((w) => w[0]?.toUpperCase() || "")
        .join("")
        .substring(0, 4);
}

export const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
    if (!certifications || certifications.length === 0) {
        return null;
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 border-t border-neutral-100">
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F1F1F] mb-3 sm:mb-4">
                    Certifications & Credentials
                </h2>
                <div className="w-16 sm:w-20 h-1 bg-[#990000] mx-auto rounded-full mb-4 sm:mb-6"></div>
                <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
                    Recognized by leading authorities for our commitment to quality, safety, and professional excellence.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {certifications.map((cert, idx) => {
                    const isRedAccent = idx % 2 === 0;
                    const accentColor = isRedAccent ? "border-[#990000]" : "border-[#FECC00]";
                    const badgeBg = isRedAccent ? "bg-[#990000]/10 text-[#990000]" : "bg-[#FECC00]/20 text-[#1F1F1F]";
                    const initials = cert.initials || getInitials(cert.issuingBody);

                    return (
                        <div
                            key={cert.id}
                            className="group relative flex flex-col items-center text-center p-6 sm:p-8 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out cursor-default"
                        >
                            {/* Logo frame */}
                            <div className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-50 border-2 ${accentColor} flex items-center justify-center mb-4 sm:mb-6 overflow-hidden group-hover:scale-105 transition-transform duration-300 ease-out shadow-sm`}>
                                {cert.imageUrl ? (
                                    <Image
                                        src={cert.imageUrl}
                                        alt={`${cert.title} logo`}
                                        fill
                                        className="object-contain p-3 sm:p-4"
                                        sizes="(max-width: 768px) 100vw, 96px"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <span className="font-extrabold text-lg sm:text-xl tracking-wider text-[#1F1F1F]">
                                        {initials}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="text-base sm:text-lg font-bold text-[#1F1F1F] mb-2 sm:mb-3 leading-tight">
                                {cert.title}
                            </h3>

                            {/* Badge */}
                            <span className={`inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4 ${badgeBg}`}>
                                {cert.badgeLabel}
                            </span>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                                {cert.description || `${cert.badgeLabel} issued by ${cert.issuingBody}.`}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
