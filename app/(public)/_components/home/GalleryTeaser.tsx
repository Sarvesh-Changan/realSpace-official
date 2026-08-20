'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { getVideoThumbnailUrl } from '@/lib/cloudinary';

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

    const displayItems = items.slice(0, 8);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.06,
            },
        },
    };

    const headerVariants: Variants = {
        hidden: { opacity: 0, y: 16 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: shouldReduceMotion ? 0.01 : 0.4, ease: "easeOut" },
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
        <section className="py-16 md:py-24 bg-white">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={headerVariants}
                >
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            Explore Our Gallery
                        </h2>
                        <p className="text-lg text-neutral-600">
                            A curated collection of our finest interior and exterior transformations.
                        </p>
                        {/* Kunku Red Accent Line */}
                        <div className="w-20 h-1 bg-[#990000] mt-6 rounded-full"></div>
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:block">
                        <Link
                            href="/gallery"
                            className="inline-flex items-center justify-center px-6 py-3 bg-[#990000] text-white font-medium rounded-md hover:bg-[#7a0000] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#990000]"
                        >
                            View Full Gallery
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* Gallery Grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                >
                    {displayItems.map((item) => (
                        <motion.div key={item.id} variants={cardVariants}>
                            <Link
                                href={`/gallery?category=${encodeURIComponent(item.category)}`}
                                className="group relative aspect-[4/5] overflow-hidden rounded-2xl block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#990000]"
                            >
                                <Image
                                    src={getVideoThumbnailUrl(item.imageUrl)}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                    referrerPolicy="no-referrer"
                                    className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
                                />

                                {/* Gradient Overlay (Fades in slightly stronger on hover) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                                {/* Text Content Container */}
                                <div className="absolute inset-0 flex flex-col justify-end p-6">
                                    <div className="transform transition-all duration-300 ease-out motion-safe:translate-y-2 motion-safe:group-hover:translate-y-0">
                                        {/* Halad Yellow Category Badge */}
                                        <span className="inline-block max-w-full truncate px-3 py-1 mb-3 text-xs font-semibold tracking-wider uppercase bg-[#FECC00] text-neutral-900 rounded-sm shadow-sm">
                                            {item.category}
                                        </span>

                                        {/* Title */}
                                        <h3 className="text-xl font-medium text-white leading-tight opacity-90 transition-opacity duration-300 group-hover:opacity-100 line-clamp-2">
                                            {item.title}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Mobile CTA */}
                <div className="mt-10 flex justify-center md:hidden">
                    <Link
                        href="/gallery"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#990000] text-white font-medium rounded-md hover:bg-[#7a0000] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#990000]"
                    >
                        View Full Gallery
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}