import React from "react";
import { Award, BookOpen, Users } from "lucide-react";

export type CertificateType = "COURSE" | "MEMBERSHIP" | "REGISTRATION";

export interface CertificationData {
    id: string;
    badgeLabel: string;
    issuingBody: string;
    certificateType: CertificateType;
}

interface CertificationsProps {
    certifications: CertificationData[];
}

const typeIconMap: Record<CertificateType, React.ElementType> = {
    COURSE: BookOpen,
    MEMBERSHIP: Users,
    REGISTRATION: Award,
};

export const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
    if (!certifications || certifications.length === 0) {
        return null;
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-neutral-100">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
                    Certifications & Credentials
                </h2>
                <div className="w-20 h-1 bg-brand-red mx-auto rounded-full mb-6"></div>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                    Recognized by leading authorities for our commitment to quality, safety, and professional excellence.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {certifications.map((cert) => {
                    const Icon = typeIconMap[cert.certificateType] || Award;

                    return (
                        <div
                            key={cert.id}
                            className="flex items-start gap-4 p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-bgAlt border border-neutral-100 flex items-center justify-center text-brand-yellow">
                                <Icon className="w-5 h-5 text-brand-red" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                                    {cert.certificateType}
                                </span>
                                <h3 className="text-base font-semibold text-brand-text mb-1 leading-tight">
                                    {cert.badgeLabel}
                                </h3>
                                <p className="text-sm text-neutral-600 leading-snug">
                                    {cert.issuingBody}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
