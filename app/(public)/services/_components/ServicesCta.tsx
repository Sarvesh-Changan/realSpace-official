import React from "react";
import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";

export function ServicesCta() {
    return (
        <section className="w-full bg-brand-text text-white py-20 md:py-32">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-red-950 text-brand-red flex items-center justify-center rounded-full mb-8">
                    <Calculator className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-2xl">
                    Ready to know what your project might cost?
                </h2>
                <p className="text-lg text-neutral-400 mb-10 max-w-2xl leading-relaxed">
                    Use our interactive quote calculator to get an estimated price range for your interior or exterior design requirements in minutes.
                </p>
                <Link
                    href="/quote"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-brand-text bg-brand-yellow hover:bg-yellow-400 rounded-full transition-colors shadow-lg hover:shadow-xl"
                >
                    Calculate Free Quote
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        </section>
    );
}
