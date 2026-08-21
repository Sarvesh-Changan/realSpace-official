import Image from "next/image";

interface AboutHeroProps {
  headline: string;
  body: string;
  imageUrl: string;
}

export function AboutHero({ headline, body, imageUrl }: AboutHeroProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-text mb-4 sm:mb-6 leading-tight">
              {headline}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-brand-text/80">
              {body}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 shadow-sm border border-neutral-100">
            <Image
              src={imageUrl}
              alt="REALSPACE team at work"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
