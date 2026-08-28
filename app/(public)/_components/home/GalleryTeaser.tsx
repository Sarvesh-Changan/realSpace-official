'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { getVideoThumbnailUrl } from '@/lib/cloudinary';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export interface GalleryTeaserItem {
    id: string;
    title: string;
    category: string;
    imageUrl: string;
}

export interface GalleryTeaserProps {
    items?: GalleryTeaserItem[];
}

export function GalleryTeaser({ items = [] }: GalleryTeaserProps) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const systemReducedMotion = useReducedMotion();
    const shouldReduceMotion = isMounted ? !!systemReducedMotion : false;

    if (!items || items.length === 0) return null;

    const displayItems = items.slice(0, 6);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.06,
            },
        },
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: shouldReduceMotion ? 0.01 : 0.4, ease: "easeOut" },
        },
    };

    return (
        <section className="relative isolate overflow-hidden border-y border-brand-dark/20 bg-brand-dark py-16 sm:py-20 md:py-24">
            {/* TODO: home-3 is a temporary static gallery backdrop pending a dedicated gallery texture asset. */}
            <Image
                src="/images/home/home-3.png"
                alt="Warm REALSPACE interior design setting"
                fill
                sizes="100vw"
                className="-z-20 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-brand-dark/65" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-dark/45 via-brand-dark/55 to-brand-dark/80" />
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-12 md:flex-row md:items-end">
                    <div className="max-w-2xl">
                        <ScrollReveal direction="left" distance={24} className="text-eyebrow text-brand-yellow">
                            A visual archive
                        </ScrollReveal>
                        <ScrollReveal direction="left" distance={28} delay={0.08}>
                        <h2 className="mt-3 font-serif text-h2 font-semibold tracking-tight text-white">
                                Explore Our Gallery
                            </h2>
                        </ScrollReveal>
                        <ScrollReveal direction="left" distance={24} delay={0.16}>
                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                                A curated collection of our finest interior and exterior transformations.
                            </p>
                        </ScrollReveal>
                        {/* Kunku Red Accent Line */}
                        <div className="mt-5 h-px w-20 bg-brand-yellow"></div>
                    </div>

                    {/* Desktop CTA */}
                    <ScrollReveal direction="right" distance={24} delay={0.1} className="hidden md:block">
                        <Link
                            href="/gallery"
                            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-yellow hover:border-brand-yellow hover:text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
                        >
                            View Full Gallery
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </ScrollReveal>
                </div>

                {/* Gallery Grid */}
                <motion.div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                >
                    {displayItems.map((item, index) => (
                        <motion.div key={item.id} variants={cardVariants}>
                            <Link
                                href={`/gallery?category=${encodeURIComponent(item.category)}`}
                                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red sm:aspect-[5/4]"
                            >
                                <Image
                                    src={getVideoThumbnailUrl(item.imageUrl)}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                    referrerPolicy="no-referrer"
                                    className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                                {/* Text Content Container */}
                                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                                    <div className="transform transition-all duration-300 ease-out motion-safe:translate-y-2 motion-safe:group-hover:translate-y-0">
                                        {/* Halad Yellow Category Badge */}
                                        <ScrollReveal direction={index % 3 === 0 ? "left" : index % 3 === 2 ? "right" : "up"} distance={16}>
                                            <span className="mb-1.5 inline-block max-w-full truncate rounded-sm border border-brand-yellow bg-brand-yellow px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-dark shadow-sm sm:mb-3 sm:px-3 sm:py-1 sm:text-xs">
                                                {item.category}
                                            </span>
                                        </ScrollReveal>

                                        {/* Title */}
                                        <ScrollReveal direction={index % 3 === 0 ? "left" : index % 3 === 2 ? "right" : "up"} distance={18} delay={0.06}>
                                            <h3 className="line-clamp-2 text-base font-medium leading-snug text-white opacity-95 transition-opacity duration-300 group-hover:opacity-100 sm:text-xl">
                                                {item.title}
                                            </h3>
                                        </ScrollReveal>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Mobile CTA */}
                <div className="mt-8 flex justify-center md:hidden">
                    <Link
                        href="/gallery"
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-brand-yellow hover:bg-brand-yellow hover:text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
                    >
                        View Full Gallery
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
