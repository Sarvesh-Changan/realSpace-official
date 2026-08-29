"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useIdleAttention } from "@/hooks/useIdleAttention";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SocialBrandIcon, type SocialPlatform } from "@/components/ui/SocialBrandIcons";

export interface HeroProps {
  heroHeadline?: string;
  heroSubhead?: string;
  ctaText?: string;
  socialLinks?: {
    instagram?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
    linkedinUrl?: string | null;
  } | null;
}

export function Hero({ heroHeadline, heroSubhead, ctaText, socialLinks }: HeroProps) {
  const isIdle = useIdleAttention(5000);
  const shouldReduceMotion = useReducedMotion();
  const headline = heroHeadline || "Your Space, Reimagined.";
  const subhead =
    heroSubhead ||
    "Interior and exterior design for Thane homes and offices that begins where your walls, beams, and budget actually are. Personal attention. Exceptional results.";
  const buttonCta = ctaText || "Get Free Quote";
  const socialPlatforms = [
    { name: "Instagram" as const, url: socialLinks?.instagram },
    { name: "Facebook" as const, url: socialLinks?.facebook },
    { name: "YouTube" as const, url: socialLinks?.youtube },
    { name: "LinkedIn" as const, url: socialLinks?.linkedin || socialLinks?.linkedinUrl },
  ].filter((platform) => Boolean(platform.url?.trim()));

  return (
    <section className="group relative isolate min-h-[700px] sm:min-h-[780px] overflow-hidden bg-brand-dark select-none">
      {/* Background Image with smooth scale hover */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/home/home-1.jpeg"
          alt="A refined REALSPACE interior design project"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-center transition-transform duration-[1600ms] ease-out motion-safe:group-hover:scale-[1.03]"
        />
      </div>

      {/* Layered Gradient Overlays for Peak Contrast & Legibility */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/92 via-black/75 to-black/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-transparent to-black/40" />

      {/* Content Container */}
      <div className="mx-auto flex min-h-[700px] sm:min-h-[780px] max-w-standard items-end px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-12">
        <div className="max-w-3xl text-white">
          
          {/* Headline */}
          <ScrollReveal direction="left" distance={36} delay={0.09}>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-md">
              {headline}
            </h1>
          </ScrollReveal>

          {/* Lead Subtitle */}
          <ScrollReveal direction="left" distance={32} delay={0.16}>
            <p className="mt-4 text-lg sm:text-xl font-semibold text-brand-yellow leading-snug drop-shadow-sm">
              {subhead}
            </p>
          </ScrollReveal>

          {/* Body Copy */}
          <ScrollReveal direction="left" distance={32} delay={0.22}>
            <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/90 font-sans drop-shadow-sm">
              At REALSPACE, we’re all about ensuring every bit of a home reflects the personality and style of the people living there. By designing your house with dedication and skill, we ensure each corner of your living space echoes the quality of a house that’s designed well and a place you can call home.
            </p>
          </ScrollReveal>

          {/* Social Links */}
          <ScrollReveal direction="left" distance={32} delay={0.28}>
            {socialPlatforms.length > 0 && (
              <nav aria-label="Social media links" className="mt-6 flex items-center gap-3.5">
                {socialPlatforms.map(({ name, url }) => (
                  <a
                    key={name}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="inline-flex rounded-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
                  >
                    <SocialBrandIcon platform={name} idPrefix={`hero-${name.toLowerCase()}`} />
                  </a>
                ))}
              </nav>
            )}
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal direction="up" distance={32} delay={0.34}>
            <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row items-center">
              <Link href="/projects" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="min-h-[52px] w-full border border-brand-yellow bg-brand-yellow px-8 text-base font-bold text-brand-dark shadow-lg hover:border-white hover:bg-white sm:w-auto transition-all duration-300 rounded-xl"
                >
                  View Our Work
                </Button>
              </Link>
              <Link href="/quote" className="relative w-full sm:w-auto">
                {isIdle && !shouldReduceMotion && (
                  <motion.span
                    initial={{ scale: 1, opacity: 0.65 }}
                    animate={{ scale: 1.08, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="pointer-events-none absolute -inset-1 rounded-xl border border-white/80"
                  />
                )}
                <Button
                  variant="secondary"
                  size="lg"
                  className="relative z-10 min-h-[52px] w-full border-white/40 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-md hover:border-brand-red hover:bg-brand-red hover:text-white sm:w-auto transition-all duration-300 rounded-xl"
                >
                  {buttonCta}
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
