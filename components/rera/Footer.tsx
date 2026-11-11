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
  { label: 'Post Property',  href: reraPath('/post-property') },
];

const quickLinksRight = [
  { label: 'Properties', href: reraPath('/properties') },
  { label: 'Gallery',    href: reraPath('/gallery') },
  { label: 'Contact',    href: reraPath('/contact') },
];

// --- Fallback contact values (shown when RERA Settings aren't filled in admin) ---
const FB_ADDRESS  = 'Raymond Realty Jekegram\nPokhran Road No 1\nThane (w), Maharashtra, India - 400606';
const FB_PHONE    = '+91 98692 11777';
const FB_EMAIL    = 'realspace.org@gmail.com';
const FB_HOURS    = '24x7 Support';

// Social icon SVGs (lucide-react v1 doesn't export brand icons)
function IgIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function FbIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}
function YtIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  );
}
function LiIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export const Footer: React.FC<FooterProps> = ({ shellProps }) => {
  const brokerName = shellProps.brokerName || 'REALSPACE';

  // Use DB value → fall back to hardcoded constant
  const address     = shellProps.address     || FB_ADDRESS;
  const phone       = shellProps.phone       || FB_PHONE;
  const altPhone    = shellProps.altPhone    || '';
  const email       = shellProps.email       || FB_EMAIL;
  const officeHours = shellProps.officeHours || FB_HOURS;

  // Social links from DB (always render the icons; link to '#' when not configured)
  const ig = shellProps.socialLinks?.instagram || '#';
  const fb = shellProps.socialLinks?.facebook  || '#';
  const yt = shellProps.socialLinks?.youtube   || '#';
  const li = shellProps.socialLinks?.linkedin  || '#';

  return (
    <footer className="w-full bg-[#141414] text-white border-t border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-6">

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
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#C8A96A] mb-5">
              Quick Links
            </h4>
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
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#C8A96A] mb-5">
              Contact Us
            </h4>
            <ul className="space-y-3.5 text-sm text-white/75">
              {/* Address */}
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-7 h-7 rounded-full bg-red-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </span>
                <span className="whitespace-pre-line leading-snug">{address}</span>
              </li>

              {/* Primary phone */}
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-white" />
                </span>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </li>

              {/* Alt phone (only if set in DB) */}
              {altPhone && (
                <li className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-white" />
                  </span>
                  <a href={`tel:${altPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                    {altPhone}
                  </a>
                </li>
              )}

              {/* Email */}
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-white" />
                </span>
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>

              {/* Office hours / 24x7 */}
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-white" />
                </span>
                <span>{officeHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[12px] text-white/40">
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} {brokerName}. All rights reserved.
          </span>

          {/* Social icons — always rendered; link to '#' until admin fills Social Links */}
          <div className="flex items-center gap-3">
            <a
              href={ig}
              target={ig === '#' ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E1306C] to-[#833AB4] flex items-center justify-center hover:opacity-90 transition-opacity text-white"
            >
              <IgIcon />
            </a>
            <a
              href={fb}
              target={fb === '#' ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-90 transition-opacity text-white"
            >
              <FbIcon />
            </a>
            <a
              href={yt}
              target={yt === '#' ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center hover:opacity-90 transition-opacity text-white"
            >
              <YtIcon />
            </a>
            <a
              href={li}
              target={li === '#' ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-90 transition-opacity text-white"
            >
              <LiIcon />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
