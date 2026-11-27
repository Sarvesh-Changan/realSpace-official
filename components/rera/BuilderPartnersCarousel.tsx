'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface BuilderPartner {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
}

const PARTNERS_PER_PAGE = 4;

export function BuilderPartnersCarousel({ partners }: { partners: BuilderPartner[] }) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [animateTrack, setAnimateTrack] = useState(true);
  const [flippedPartnerId, setFlippedPartnerId] = useState<string | null>(null);
  const pageCount = Math.ceil(partners.length / PARTNERS_PER_PAGE);
  const pages = Array.from({ length: pageCount }, (_, page) =>
    partners.slice(page * PARTNERS_PER_PAGE, (page + 1) * PARTNERS_PER_PAGE),
  );
  const displayPages = pageCount > 1 ? [...pages, pages[0]] : pages;
  const activePage = pageCount ? trackIndex % pageCount : 0;

  useEffect(() => {
    if (pageCount < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setFlippedPartnerId(null);
      setAnimateTrack(true);
      setTrackIndex((current) => current + 1);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [pageCount]);

  const handleTrackTransitionEnd = () => {
    if (trackIndex === pageCount) {
      setAnimateTrack(false);
      setTrackIndex(0);
    }
  };

  const goToPage = (page: number) => {
    setFlippedPartnerId(null);
    setAnimateTrack(true);
    setTrackIndex(page);
  };

  return (
    <>
      <div className="overflow-hidden">
        <div
          className={`flex ${animateTrack ? 'transition-transform duration-700 ease-in-out' : ''}`}
          style={{ transform: `translateX(-${trackIndex * 100}%)` }}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget) handleTrackTransitionEnd();
          }}
        >
          {displayPages.map((page, pageIndex) => (
            <div key={`partner-page-${pageIndex}`} aria-hidden={pageIndex !== activePage} className="grid w-full shrink-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-[30px]">
              {page.map((partner) => (
                <article key={`${pageIndex}-${partner.id}`} className="h-[334px]">
                  <button
                    type="button"
                    aria-label={`Show details for ${partner.name}`}
                    aria-pressed={flippedPartnerId === partner.id}
                    data-flipped={flippedPartnerId === partner.id}
                    tabIndex={pageIndex === activePage ? 0 : -1}
                    onClick={() => setFlippedPartnerId((current) => current === partner.id ? null : partner.id)}
                    className="rera-partner-flip group block h-full w-full text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#79b9ed]"
                  >
                    <span className="rera-partner-flip-inner relative block h-full w-full transition-transform duration-700">
                      <span className="rera-partner-flip-face absolute inset-0 flex flex-col bg-white">
                        <span className="relative block h-[232px] shrink-0 overflow-hidden bg-white">
                          <Image
                            src={partner.logoUrl}
                            alt={`${partner.name} logo`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-contain p-1"
                          />
                        </span>
                        <span className="flex flex-1 items-center justify-center px-3 text-base font-bold uppercase leading-tight tracking-wide text-black">
                          Flats &amp; Apartments
                        </span>
                      </span>
                      <span className="rera-partner-flip-face rera-partner-flip-back absolute inset-0 flex flex-col items-center justify-center bg-[#0D2253] px-6 py-7 text-white">
                        <span className="mb-4 block h-1 w-10 bg-[#79b9ed]" aria-hidden="true" />
                        <span className="block text-lg font-bold uppercase leading-tight tracking-wide">{partner.name}</span>
                        <span className="mt-4 block max-h-40 overflow-y-auto text-sm leading-relaxed text-white/85">
                          {partner.description.trim() || 'A trusted partner for quality homes and communities.'}
                        </span>
                        <span className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b9d8f4]">Tap to return</span>
                      </span>
                    </span>
                  </button>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <nav className="mt-11 flex items-center justify-center gap-2.5" aria-label="Partner pages">
          {Array.from({ length: pageCount }, (_, page) => (
            <button
              key={page}
              type="button"
              aria-label={`Show partner page ${page + 1}`}
              aria-current={activePage === page ? 'page' : undefined}
              onClick={() => goToPage(page)}
              className="flex h-11 w-11 items-center justify-center rounded-full"
            >
              <span aria-hidden="true" className={`h-2 w-2 rounded-[1px] border border-white/80 ${activePage === page ? 'bg-[#79b9ed]' : 'bg-transparent'}`} />
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
