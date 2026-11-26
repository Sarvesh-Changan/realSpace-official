import Link from 'next/link';
import type { TextBlockData } from '@/lib/rera/property-sections/schemas';

export function TextBlockSection({ data, title }: { data: TextBlockData; title?: string | null }) {
  const alignment = data.align === 'center' ? 'text-center' : 'text-left';
  const buttonClass = 'inline-flex items-center justify-center bg-[#1C1C1C] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C8A96A] hover:text-[#1C1C1C]';
  return (
    <section className={`border border-[#E8E2DA] bg-white p-5 sm:p-7 ${alignment}`}>
      {title && <h2 className="whitespace-pre-line font-heading text-xl sm:text-2xl font-bold text-[#1C1C1C]">{title}</h2>}
      {data.subtitle && <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-[#6D6A66]">{data.subtitle}</p>}
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#444444]">{data.body}</p>
      {data.cta && (data.cta.href.startsWith('/')
        ? <Link href={data.cta.href} className={`${buttonClass} mt-5 whitespace-pre-line`}>{data.cta.label}</Link>
        : <a href={data.cta.href} className={`${buttonClass} mt-5 whitespace-pre-line`}>{data.cta.label}</a>)}
    </section>
  );
}
