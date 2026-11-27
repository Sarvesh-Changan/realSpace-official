'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { reraPath, navLinks } from '@/lib/rera/routes';
import type { ReraShellProps } from '@/types/rera';

interface TopBarProps {
  shellProps: ReraShellProps;
  onOpenConsultation?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ shellProps, onOpenConsultation }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const phone = shellProps.phone ?? '';
  const whatsapp = shellProps.whatsapp ?? '';
  const email = shellProps.email ?? '';
  const phoneClean = phone.replace(/\s+/g, '');

  const handleOpenModal = () => {
    if (onOpenConsultation) {
      onOpenConsultation();
    } else {
      window.dispatchEvent(new CustomEvent('open-consultation-modal'));
    }
  };

  return (
    <>
      {/* Upper Trust & Compliance Ribbon */}
      <div className="bg-[#1C1C1C] text-[#EEE6DD] text-xs py-2 px-4 sm:px-8 border-b border-[#333333]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Right: Instant Phone & WhatsApp Direct Contacts */}
          <div className="flex items-center gap-4 text-xs">
            {phone && (
              <a
                href={`tel:${phoneClean}`}
                className="flex min-w-0 items-center gap-1 break-words text-[#EEE6DD] hover:text-[#C8A96A] transition-colors"
              >
                <Phone className="w-3 h-3 text-[#C8A96A]" />
                <span className="hidden md:inline">Call us:</span> {phone}
              </a>
            )}
            {phone && whatsapp && <span className="text-[#6D6A66]">·</span>}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20properties%20in%20Thane.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-1 break-words text-[#25D366] hover:text-[#20ba5a] transition-colors font-medium"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            )}
            {email && (
              <>
                <span className="text-[#6D6A66] hidden lg:inline">·</span>
                <a
                  href={`mailto:${email}`}
                  className="hidden lg:flex items-center gap-1 text-[#A39E98] hover:text-[#C8A96A] transition-colors whitespace-nowrap"
                >
                  <Mail className="w-3 h-3 text-[#C8A96A]" />
                  <span>{email}</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/98 backdrop-blur-md border-b border-[#E8E2DA] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto min-w-0 px-4 sm:px-8 py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Brand Wordmark */}
          <Link
            href={reraPath('/')}
            aria-label="REALSPACE RERA home"
            className="flex min-w-0 items-center whitespace-nowrap shrink-0 focus:outline-none"
          >
            <Image
              src="/arnav/images/logo/rera-logo.png"
              alt="REALSPACE logo"
              width={220}
              height={36}
              className="h-10 w-[132px] object-contain sm:w-[172px] lg:w-[184px]"
            />
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center">
            {navLinks.map((link, idx) => {
              const homePath = reraPath('/');
              const isActive =
                link.href === homePath
                  ? pathname === homePath
                  : pathname.startsWith(link.href);

              return (
                <React.Fragment key={link.label}>
                  <Link
                    href={link.href}
                    className={`px-4 xl:px-5 py-2 text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-[#0088CC] font-bold'
                        : 'text-[#4A4A4A] hover:text-[#0088CC]'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {idx < navLinks.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="h-4 border-r border-dashed border-[#D1D5DB] inline-block"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Mobile Hamburger */}
          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={handleOpenModal}
              className="realspace-cta rera-visit-full shrink-0 px-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
            >
              <span>Schedule Visit</span>
            </button>

            <button
              onClick={handleOpenModal}
              className="inline-flex min-h-11 min-w-11 items-center justify-center bg-[#0D2253] px-2 text-[10px] font-semibold uppercase tracking-wide text-white min-[480px]:hidden"
              aria-label="Schedule Visit"
            >
              Visit
            </button>

            {shellProps.reraRegistrationNo && (
              <span className="hidden xl:flex items-center gap-1.5 text-xs tracking-wide text-[#1C1C1C] whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0088CC]" />
                MahaRERA Reg. No. {shellProps.reraRegistrationNo}
              </span>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-[#1C1C1C] hover:text-[#0088CC] focus:outline-none lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="max-h-[calc(100dvh-4rem)] w-full overflow-y-auto overscroll-contain bg-white border-b border-[#E8E2DA] px-6 py-6 animate-in slide-in-from-top duration-200 shadow-xl lg:hidden">
            <div className="flex flex-col gap-4">
              <div className="text-xs font-semibold text-[#6D6A66] uppercase tracking-wider mb-1">
                Navigation
              </div>
              {navLinks.map((link) => {
                const homePath = reraPath('/');
                const isActive =
                  link.href === homePath
                    ? pathname === homePath
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-semibold tracking-wider uppercase py-2 border-b border-[#E8E2DA]/50 transition-colors ${
                      isActive ? 'text-[#0088CC]' : 'text-[#1C1C1C] hover:text-[#0088CC]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenModal();
                  }}
                  className="min-h-11 w-full py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] bg-[#C8A96A] hover:bg-[#B78A47] hover:text-white transition-colors"
                >
                  Schedule Site Visit &amp; Consultation
                </button>
                <div className="flex items-center justify-center gap-4 pt-2 text-xs text-[#6D6A66]">
                  {phone && (
                    <a
                      href={`tel:${phoneClean}`}
                      className="flex items-center gap-1.5 text-[#1C1C1C]"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#C8A96A]" />
                      Call Us
                    </a>
                  )}
                  {phone && whatsapp && <span>·</span>}
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#25D366] font-medium"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp Chat
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
