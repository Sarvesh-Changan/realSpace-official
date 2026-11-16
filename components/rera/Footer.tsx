'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import type { ReraShellProps } from '@/types/rera';

interface FooterProps {
  shellProps: ReraShellProps;
}

// Only link to routes that actually exist under /rera
const quickLinksLeft = [
  { label: 'Home',           href: reraPath('/') },
  { label: 'About Us',       href: reraPath('/about') },
  { label: 'Services',       href: reraPath('/services') },
];

const quickLinksRight = [
  { label: 'Properties', href: reraPath('/properties') },
  { label: 'Contact',    href: reraPath('/contact') },
];

// --- Fallback contact values (shown when RERA Settings aren't filled in admin) ---

// Social icon SVGs (lucide-react v1 doesn't export brand icons)
function IgIcon() {
  return (
    <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="rera-footer-ig-grad" cx="30%" cy="107%" r="130%">
          <stop offset="0%" stopColor="#fdf497" /><stop offset="5%" stopColor="#fdf497" /><stop offset="45%" stopColor="#fd5949" /><stop offset="60%" stopColor="#d6249f" /><stop offset="100%" stopColor="#285AEB" />
        </radialGradient>
        <linearGradient id="rera-footer-ig-shine" x1="4" y1="3" x2="19" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.28" /><stop offset="0.42" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id="rera-footer-ig-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.4" /></filter>
      </defs>
      <rect width="24" height="24" rx="6.5" fill="url(#rera-footer-ig-grad)" filter="url(#rera-footer-ig-shadow)" />
      <rect width="24" height="24" rx="6.5" fill="url(#rera-footer-ig-shine)" />
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#FFFFFF" strokeWidth="1.8" /><circle cx="17.2" cy="6.8" r="1.1" fill="#FFFFFF" />
    </svg>
  );
}
function FbIcon() {
  return (
    <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rera-footer-facebook-grad" x1="7" y1="2" x2="17" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#42A5F5" /><stop offset="0.5" stopColor="#0866FF" /><stop offset="1" stopColor="#0052CC" /></linearGradient>
        <filter id="rera-footer-facebook-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.4" /></filter>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#rera-footer-facebook-grad)" filter="url(#rera-footer-facebook-shadow)" />
      <path d="M13.5 21V12.75H16.25L16.7 9.5H13.5V7.5C13.5 6.6 13.8 6 15.1 6H16.8V3.15C16.5 3.1 15.5 3 14.3 3C11.8 3 10.1 4.5 10.1 7.3V9.5H7.3V12.75H10.1V21H13.5Z" fill="#FFFFFF" />
    </svg>
  );
}
function YtIcon() {
  return (
    <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rera-footer-youtube-grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#FF4B55" /><stop offset="0.5" stopColor="#FF0000" /><stop offset="1" stopColor="#D90000" /></linearGradient>
        <filter id="rera-footer-youtube-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.4" /></filter>
      </defs>
      <rect x="1" y="4" width="22" height="16" rx="4.5" fill="url(#rera-footer-youtube-grad)" filter="url(#rera-footer-youtube-shadow)" /><path d="M9.75 8.25L15.75 12L9.75 15.75V8.25Z" fill="#FFFFFF" />
    </svg>
  );
}
function LiIcon() {
  return (
    <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rera-footer-linkedin-grad" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#35A7E8" /><stop offset="0.5" stopColor="#0A66C2" /><stop offset="1" stopColor="#004182" /></linearGradient>
        <filter id="rera-footer-linkedin-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.4" /></filter>
      </defs>
      <rect width="24" height="24" rx="4.5" fill="url(#rera-footer-linkedin-grad)" filter="url(#rera-footer-linkedin-shadow)" />
      <path d="M5.2 8.8H8.3V18.8H5.2V8.8ZM6.75 5.2C5.75 5.2 5 5.95 5 6.95C5 7.95 5.75 8.7 6.75 8.7C7.75 8.7 8.5 7.95 8.5 6.95C8.5 5.95 7.75 5.2 6.75 5.2ZM15.8 8.8C14.1 8.8 13.3 9.7 12.9 10.3V8.8H9.8V18.8H12.9V13.6C12.9 12.2 13.2 11.2 14.8 11.2C16.4 11.2 16.4 12.7 16.4 13.7V18.8H19.5V13.1C19.5 10.3 18.9 8.8 15.8 8.8Z" fill="#FFFFFF" />
    </svg>
  );
}

export const Footer: React.FC<FooterProps> = ({ shellProps }) => {
  const brokerName = 'REALSPACE';
  const address     = shellProps.address || 'Raymond Realty Jekegram\nPokhran Road No 1\nThane (w), Maharashtra, India - 400606';
  const phone       = shellProps.phone || '+91 98692 11777';
  const altPhone    = shellProps.altPhone    || '';
  const email       = shellProps.email || 'realspace.org@gmail.com';
  const officeHours = shellProps.officeHours || '24x7 Support';

  // Social links from DB (always render the icons; link to '#' when not configured)
  const socials = [
    shellProps.socialLinks?.instagram ? { label: 'Instagram', href: shellProps.socialLinks.instagram, icon: <IgIcon /> } : null,
    shellProps.socialLinks?.facebook ? { label: 'Facebook', href: shellProps.socialLinks.facebook, icon: <FbIcon /> } : null,
    shellProps.socialLinks?.youtube ? { label: 'YouTube', href: shellProps.socialLinks.youtube, icon: <YtIcon /> } : null,
    shellProps.socialLinks?.linkedin ? { label: 'LinkedIn', href: shellProps.socialLinks.linkedin, icon: <LiIcon /> } : null,
  ].filter((item) => item !== null);

  return (
    <footer className="relative w-full bg-[#111111] text-white border-t border-[#2A2A2A]">
      <div className="absolute inset-0 bg-[url('/arnav/images/footer-bg-map.png')] bg-auto bg-center bg-no-repeat" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-6">

        {/* ── Main Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-[#2A2A2A]">

          {/* Col 1 — Logo */}
          <div className="flex flex-col items-start gap-4">
            <Link href={reraPath('/')} aria-label={brokerName}>
              <Image
                src="/images/realspace_logo.png"
                alt={`${brokerName} logo`}
                width={160}
                height={72}
                style={{ width: 160, height: 'auto' }}
                className="object-contain"
                priority={false}
              />
            </Link>
            {shellProps.reraRegistrationNo && (
              <p className="text-[11px] text-white/50 leading-relaxed max-w-[220px]">
                MahaRERA Reg. No.{' '}
                <span className="text-white/70">{shellProps.reraRegistrationNo}</span>
              </p>
            )}
          </div>

          {/* Col 2 — Quick Links (two sub-cols) */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-5">
              Quick Links
            </h4>
            <div aria-hidden="true" className="-mt-3 mb-5 h-0.5 w-10 bg-[#A9CEF5]" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {quickLinksLeft.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/75 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {quickLinksRight.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/75 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3 — Contact Us */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-5">
              Contact Us
            </h4>
            <div aria-hidden="true" className="-mt-3 mb-5 h-0.5 w-10 bg-[#A9CEF5]" />
            <ul className="space-y-3.5 text-sm text-white/75">
              {[
                { icon: MapPin, value: address, kind: 'address' as const },
                { icon: Phone, value: phone, kind: 'phone' as const },
                { icon: Mail, value: email, kind: 'email' as const },
                { icon: Clock, value: officeHours, kind: 'hours' as const },
              ].map(({ icon: Icon, value, kind }) => (
                <li key={kind} className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-red-600 shadow-inner">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {kind === 'address' ? (
                    <span className="whitespace-pre-line pt-0.5 leading-[1.65] text-white/70">{value}</span>
                  ) : kind === 'phone' ? (
                    <a href={`tel:${value.replace(/[^+\d]/g, '')}`} className="pt-2 text-white/85 transition-colors hover:text-white">{value}</a>
                  ) : kind === 'email' ? (
                    <a href={`mailto:${value}`} className="pt-2 text-white/85 transition-colors hover:text-white">{value}</a>
                  ) : (
                    <span className="pt-2 text-white/85">{value}</span>
                  )}
                </li>
              ))}
            </ul>
              {altPhone && <a href={`tel:${altPhone.replace(/[^+\d]/g, '')}`} className="ml-[54px] -mt-1 block text-sm text-white/75 transition-colors hover:text-white">{altPhone}</a>}
          </div>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[12px] text-white/40">
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} {brokerName}. All rights reserved.
          </span>
          {socials.length > 0 && <div className="flex items-center gap-3">
            {socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="inline-flex rounded-full transition-transform duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8A96A]">{social.icon}</a>)}
          </div>}
        </div>

      </div>
    </footer>
  );
};
