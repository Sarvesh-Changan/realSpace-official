import Image from 'next/image';
import type { InfoCardsData } from '@/lib/rera/property-sections/schemas';

export function InfoCardsSection({ data, title }: { data: InfoCardsData; title?: string | null }) {
  return (
    <section className="space-y-5">
      {title && <h2 className="whitespace-pre-line font-heading text-xl sm:text-2xl font-bold text-[#1C1C1C]">{title}</h2>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.cards.map((card, index) => (
          <article key={`${card.title}-${index}`} className="flex flex-col overflow-hidden border border-[#E8E2DA] bg-white">
            <div className="flex-1 p-5 text-center">
              <h3 className="break-words whitespace-pre-line font-heading text-center text-lg font-bold text-[#1C1C1C]">{card.title}</h3>
              {card.lines.length > 0 && (
                <ul className="mt-4 list-none space-y-2 text-center text-sm leading-relaxed text-[#444444]">
                  {card.lines.map((line, lineIndex) => <li key={lineIndex} className="break-words whitespace-pre-line">{line}</li>)}
                </ul>
              )}
              {card.body && <p className="mt-4 break-words whitespace-pre-line text-sm leading-relaxed text-[#6D6A66]">{card.body}</p>}
            </div>
            {card.image && (
              <div className="relative aspect-[16/9] w-full bg-[#EEE6DD]">
                <Image src={card.image.url} alt={card.image.alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
