import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TrustStats } from "./TrustStats";

interface WelcomeIntroProps {
  intro?: string;
}

const fallbackIntro =
  "Interior and exterior design for Thane homes and offices that begins where your walls, beams, and budget actually are. Personal attention. Exceptional results.";

export function WelcomeIntro({ intro }: WelcomeIntroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-cream py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-standard px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="max-w-2xl">
            <ScrollReveal direction="left" distance={28} className="text-eyebrow text-brand-red">
              <h4 className="mt-4 font-serif text-[14px] font-bold tracking-tight text-brand-text">Welcome to REALSPACE</h4>
            </ScrollReveal>
            <ScrollReveal direction="left" distance={32} delay={0.08}>
              <h2 className="mt-4 font-serif text-h2 font-semibold tracking-tight text-brand-text">
                Spaces with a point of view.
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="left" distance={28} delay={0.16}>
              <p className="mt-5 max-w-xl text-body-large text-brand-text/70">
                {intro || fallbackIntro}
              </p>
            </ScrollReveal>
            <div className="mt-7 h-px w-20 bg-brand-yellow" />
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-2xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-8 border-white/70 shadow-xl">
              <Image
                src="/images/home/home-2-1.jpeg"
                alt="REALSPACE interior design detail"
                fill
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden h-20 w-20 rounded-full border border-brand-yellow/70 sm:block" />
          </div>
        </div>

        <div className="mt-12 sm:mt-16">
          <TrustStats compact directional />
        </div>
      </div>
    </section>
  );
}
