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
    <section className="group relative isolate min-h-[680px] overflow-hidden bg-brand-dark sm:min-h-[740px]">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/home/home-1.jpeg"
          alt="A refined REALSPACE interior design project"
          fill
          priority
          sizes="100vw"
          quality={70}
          className="object-cover transition-transform duration-[1400ms] ease-out motion-safe:group-hover:scale-[1.03]"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

      <div className="mx-auto flex min-h-[680px] max-w-standard items-end px-4 pb-16 pt-32 sm:min-h-[740px] sm:px-6 sm:pb-24 lg:px-8">
        <div className="max-w-3xl text-white">
          <ScrollReveal direction="left" distance={36} delay={0.09}>
            <h1 className="mt-5 max-w-3xl font-serif text-display font-semibold tracking-tight text-white">
            {headline}
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="left" distance={32} delay={0.18}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg md:text-xl">
              {subhead}
            </p>
          </ScrollReveal>
          <ScrollReveal direction="left" distance={32} delay={0.18}>
            <p>At REALSPACE, we’re all about ensuring every bit of a home reflects the personality and style of the people living there. By designing your house with dedication and skill, we ensure each corner of your living space echoes the quality of a house that’s designed well and a place you can call home.</p>
          </ScrollReveal>
          <ScrollReveal direction="left" distance={32} delay={0.18}>
          {socialPlatforms.length > 0 && (
            <nav aria-label="Social media links" className="mt-6 flex items-center gap-3">
              {socialPlatforms.map(({ name, url }) => (
                <a
                  key={name}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="inline-flex rounded-md transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
                >
                  <SocialBrandIcon platform={name} idPrefix={`hero-${name.toLowerCase()}`} />
                </a>
              ))}
            </nav>
          )}
          </ScrollReveal>
          <ScrollReveal direction="up" distance={32} delay={0.18}>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/projects" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="min-h-[50px] w-full border border-brand-yellow bg-brand-yellow px-8 font-semibold text-brand-dark shadow-lg hover:border-white hover:bg-white sm:w-auto"
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
                  className="pointer-events-none absolute -inset-1 rounded-md border border-white/80"
                />
              )}
              <Button
                variant="secondary"
                size="lg"
                className="relative z-10 min-h-[50px] w-full border-white bg-white/10 px-8 font-semibold text-white backdrop-blur-sm hover:border-brand-red hover:bg-brand-red hover:text-brand-dark sm:w-auto"
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
