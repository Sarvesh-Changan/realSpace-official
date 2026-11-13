import Link from 'next/link';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import type { ReraBranchProps } from '@/types/rera';

interface ContactSettings {
  address: string | null;
  phone: string | null;
  email: string | null;
}

export function HomeContactSection({ settings, branch }: { settings: ContactSettings; branch: ReraBranchProps | null }) {
  const officeAddress = 'REALSPACE, Jekegram, Pokhran Road No. 1, Thane, Maharashtra 400606';
  const address = settings.address || branch?.address || officeAddress;
  const mapUrl = branch?.mapUrl || `https://maps.google.com/maps?hl=en&q=${encodeURIComponent(address.replace(/\n/g, ', '))}&z=15&output=embed`;
  const phone = settings.phone || branch?.phone || null;
  const hasContact = Boolean(address || phone || settings.email);

  return (
    <section className="bg-[#EEE6DD] py-16 sm:py-20" aria-labelledby="rera-home-contact-title">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
        <div className="flex flex-col justify-center border-l-2 border-[#C8A96A] py-3 pl-6 sm:pl-9">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7539]">Get in touch</p>
          <h2 id="rera-home-contact-title" className="font-heading text-3xl font-bold text-[#1C1C1C] sm:text-4xl">Let’s discuss your property enquiry</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[#6D6A66]">Contact REALSPACE about a property or real estate service.</p>
          <div className="mt-6 space-y-3 text-sm text-[#3D3A36]">
            {address && <p className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7539]" /><span className="whitespace-pre-line">{address}</span></p>}
            {phone && <a className="flex gap-3 hover:text-[#9A7539]" href={`tel:${phone.replace(/\s+/g, '')}`}><Phone className="h-4 w-4 text-[#9A7539]" />{phone}</a>}
            {settings.email && <a className="flex gap-3 hover:text-[#9A7539]" href={`mailto:${settings.email}`}><Mail className="h-4 w-4 text-[#9A7539]" />{settings.email}</a>}
            {!hasContact && <p>Contact details will be available here when configured.</p>}
          </div>
          <Link href={reraPath('/contact')} className="mt-8 inline-flex w-fit items-center gap-2 bg-[#1C1C1C] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#C8A96A] hover:text-[#1C1C1C]">Make an enquiry <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="relative min-h-[280px] overflow-hidden border border-[#D6CEC3] bg-[#E5DED5] sm:min-h-[360px]">
          <iframe
            title={`Map for ${branch?.name || 'REALSPACE office'}`}
            src={mapUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
