interface Stat {
  label: string;
  value: string;
}

interface TrustIndicatorsProps {
  stats: Stat[];
}

export function TrustIndicators({ stats }: TrustIndicatorsProps) {
  return (
    <section className="py-12 bg-brand-bgAlt border-y border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-12 text-center sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="mx-auto flex max-w-xs flex-col gap-y-3">
              <dt className="text-base leading-7 text-brand-text/70">{stat.label}</dt>
              <dd className="order-first text-4xl font-bold tracking-tight text-brand-red sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
