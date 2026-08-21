interface Stat {
  label: string;
  value: string;
}

interface TrustIndicatorsProps {
  stats: Stat[];
}

export function TrustIndicators({ stats }: TrustIndicatorsProps) {
  return (
    <section className="py-8 sm:py-12 bg-brand-bgAlt border-y border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="mx-auto flex max-w-xs flex-col gap-y-1.5 sm:gap-y-3">
              <dt className="text-xs sm:text-sm md:text-base leading-relaxed text-brand-text/70">{stat.label}</dt>
              <dd className="order-first text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-red">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
