'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  MapPin,
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
          {/* Left: MahaRERA Registration (only when reraRegistrationNo is non-empty) */}
          <div className="flex items-center gap-3 text-xs tracking-wide">
            {shellProps.reraRegistrationNo ? (
              <span className="flex items-center gap-1.5 text-[#C8A96A] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                MahaRERA Registered Broker — Reg. No. {shellProps.reraRegistrationNo}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#A39E98]">
                <MapPin className="w-3 h-3 text-[#C8A96A]" />
                Thane West &amp; Mumbai MMR
              </span>
            )}
            {shellProps.reraRegistrationNo && (
              <>
                <span className="text-[#6D6A66] hidden sm:inline">|</span>
                <span className="text-[#A39E98] hidden sm:flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C8A96A]" />
                  Thane West &amp; Mumbai MMR
                </span>
              </>
            )}
          </div>

          {/* Right: Instant Phone & WhatsApp Direct Contacts */}
          <div className="flex items-center gap-4 text-xs">
            {phone && (
              <a
                href={`tel:${phoneClean}`}
                className="flex items-center gap-1 text-[#EEE6DD] hover:text-[#C8A96A] transition-colors whitespace-nowrap"
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
                className="flex items-center gap-1 text-[#25D366] hover:text-[#20ba5a] transition-colors whitespace-nowrap font-medium"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <Link
            href={reraPath('/')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-sm bg-[#1C1C1C] flex items-center justify-center text-[#C8A96A] font-heading font-bold text-lg shadow-sm group-hover:bg-[#C8A96A] group-hover:text-[#1C1C1C] transition-colors">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-wide text-[#1C1C1C] leading-none">
                {shellProps.brokerName || 'REALSPACE'}
              </span>
              {shellProps.tagline && (
                <span className="text-[10px] uppercase tracking-widest text-[#6D6A66] font-medium leading-tight">
                  {shellProps.tagline}
                </span>
              )}
            </div>
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
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenModal}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] bg-[#C8A96A] hover:bg-[#B78A47] hover:text-white transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <span>Schedule Visit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#1C1C1C] hover:text-[#0088CC] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E8E2DA] px-6 py-6 animate-in slide-in-from-top duration-200 shadow-xl">
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
                  className="w-full py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] bg-[#C8A96A] hover:bg-[#B78A47] hover:text-white transition-colors"
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
