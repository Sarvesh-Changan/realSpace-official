'use client';

import Link from 'next/link';
import { reraPath } from '@/lib/rera/routes';

export function PropertyMobileActions() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-3 border-t border-[#E8E2DA] bg-white/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(0,0,0,.12)] backdrop-blur md:hidden">
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-consultation-modal'))} className="min-h-11 bg-[#0D2253] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white">Schedule Visit</button>
      <Link href={reraPath('/contact')} className="flex min-h-11 items-center justify-center bg-[#FECC00] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#1C1C1C]">Enquire</Link>
    </div>
  );
}
