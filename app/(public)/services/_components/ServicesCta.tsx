import React from "react";
import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";

export function ServicesCta() {
    return (
        <section className="w-full bg-brand-bg py-20 md:py-32 border-t border-neutral-200/60">
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center bg-brand-bgAlt/70 border border-neutral-200/80 rounded-3xl p-10 md:p-16 text-brand-text shadow-sm backdrop-blur-sm">
                <div className="w-16 h-16 bg-red-100/80 text-brand-red flex items-center justify-center rounded-full mb-6">
                    <Calculator className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-brand-text mb-6 max-w-2xl">
                    Ready to know what your project might cost?
                </h2>
                <p className="text-lg text-neutral-600 mb-10 max-w-2xl leading-relaxed">
                    Use our interactive quote calculator to get an estimated price range for your interior or exterior design requirements in minutes.
                </p>
                <Link
                    href="/quote"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-brand-red hover:bg-brand-red/90 rounded-full transition-all shadow-md hover:shadow-lg"
                >
                    Calculate Free Quote
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        </section>
    );
}
