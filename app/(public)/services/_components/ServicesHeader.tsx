import React from "react";

interface ServicesHeaderProps {
    title: string;
    intro: string;
}

export function ServicesHeader({ title, intro }: ServicesHeaderProps) {
    return (
        <section className="w-full bg-brand-bgAlt py-16 md:py-24 border-b border-neutral-200">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-6 tracking-tight">
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl">
                    {intro}
                </p>
            </div>
        </section>
    );
}
