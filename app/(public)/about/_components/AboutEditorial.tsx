"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Certifications, type CertificationData } from "./Certifications";

const founderCopy = [
  "Vijay Chawan is the founder and CEO of REALSPACE. An interior designer by profession and a Mumbai University graduate, he started REALSPACE in 1989. He grew up in a middle-class family in rural Konkan, Maharashtra, which shaped his practical understanding of people, spaces and value.",
  "With Vijay’s vision and a passionate team, REALSPACE brings clients’ visions to life through beautiful, functional and personalized spaces. His goal is to create vibrant, comfortable and luxurious environments that reflect each client’s personality.",
  "Vijay’s design philosophy focuses on functional and aesthetically pleasing spaces, with attention to sustainable and universal design principles. He personally understands each client’s needs, preferences and choices before developing the design.",
  "REALSPACE is a Thane–Mumbai–Navi Mumbai interior design firm specializing in residential, commercial and turnkey projects.",
];

const foundationCopy = [
  "Since 1989, REALSPACE has been creating exceptional homes with well-crafted modular designs, quality raw materials, professional installation and rigorous quality checks within budget.",
  "REALSPACE approaches every residential project with the vision to inspire clients and deliver beyond expectations. Each design is unique while reflecting REALSPACE’s signature approach to furniture makeovers, understated luxury, customized furnishings, layered materials and unexpected details.",
  "Every project starts from scratch with solutions designed around the client’s personality, space and desired image.",
];

const reveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export function AboutEditorial({ certifications }: { certifications: CertificationData[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const transition = reduceMotion ? { duration: 0.01 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };
  const initial = reduceMotion ? false : "hidden";

  return (
    <div className="overflow-hidden bg-brand-warmWhite">
      <section className="relative isolate min-h-[72vh] bg-brand-dark text-white">
        <Image src="/images/hero-living-room.png" alt="REALSPACE interior design studio" fill priority sizes="100vw" quality={70} className="-z-20 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-brand-dark/65" />
        <div className="mx-auto flex min-h-[72vh] max-w-standard items-end px-5 pb-14 pt-32 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
          <motion.div initial={initial} whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal} transition={transition} className="max-w-4xl">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-yellow">EST. 1989</p>
            <h1 className="max-w-3xl font-serif text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl">MEET OUR FOUNDER</h1>
            <p className="mt-7 max-w-2xl text-xs font-semibold uppercase tracking-[0.18em] text-white/75">THANE · MUMBAI · NAVI MUMBAI</p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-standard gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12 lg:py-36">
        <motion.div initial={initial} whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal} transition={transition} className="relative mx-auto w-full max-w-md lg:mx-0">
          <div className="absolute -left-3 -top-3 h-full w-full border border-brand-yellow/70 sm:-left-5 sm:-top-5" />
          <div className="relative aspect-[4/5] overflow-hidden bg-brand-cream"><Image src="/images/owner_image.jpeg" alt="Vijay Chawan" fill sizes="(max-width: 1024px) 90vw, 35vw" className="object-cover object-top" /></div>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted">RESIDENTIAL · COMMERCIAL · TURNKEY</p>
        </motion.div>

        <motion.div initial={initial} whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal} transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }} className="lg:pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">MEET OUR FOUNDER</p>
          <h2 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight text-brand-text sm:text-6xl">Vijay Chawan — Principal Designer &amp; Founder, REALSPACE</h2>
          <div className="mt-8 max-w-2xl space-y-5 text-[15px] leading-[1.85] text-brand-text/75 sm:text-base">{founderCopy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </motion.div>
      </section>

      <section className="relative bg-brand-cream">
        <div className="mx-auto grid max-w-standard items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:px-12 lg:py-36">
          <motion.div initial={initial} whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal} transition={transition}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">FOUNDATION</p>
            <h2 className="mt-5 font-serif text-4xl font-bold leading-tight text-brand-text sm:text-6xl">FOUNDATION</h2>
            <div className="mt-8 max-w-2xl space-y-5 text-[15px] leading-[1.85] text-brand-text/75 sm:text-base">{foundationCopy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </motion.div>
          <motion.div initial={initial} whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal} transition={{ ...transition, delay: reduceMotion ? 0 : 0.12 }} className="relative aspect-[4/5] overflow-hidden bg-brand-dark"><Image src="/images/about/foundation.png" alt="REALSPACE interior design" fill sizes="(max-width: 1024px) 90vw, 35vw" className="object-cover" /><div className="absolute inset-0 bg-brand-dark/20" /></motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-standard px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <motion.div initial={initial} whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal} transition={transition} className="mx-auto max-w-4xl border-t border-brand-border pt-8 text-center sm:pt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">OUR TEAM OF EXPERTS</p>
          <h2 className="mt-5 font-serif text-4xl font-bold leading-tight text-brand-text sm:text-6xl">OUR TEAM OF EXPERTS</h2>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-[1.85] text-brand-text/75 sm:text-xl">“Our team consists of highly skilled and experienced interior designers, architects, engineers and artisans who share our passion for creating exceptional living spaces. Every project is a collaboration, where client preferences guide personalized design and precise execution.”</p>
        </motion.div>
      </section>

      <Certifications certifications={certifications} />
    </div>
  );
}
