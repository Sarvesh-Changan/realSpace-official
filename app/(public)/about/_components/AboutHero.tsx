import Image from "next/image";

interface AboutHeroProps {
  headline: string;
  body: string;
  imageUrl: string;
}

export function AboutHero({ headline, body, imageUrl }: AboutHeroProps) {
  return (
    <section className="py-20 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-brand-text sm:text-5xl mb-6">
              {headline}
            </h1>
            <p className="text-lg leading-8 text-brand-text/80">
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
