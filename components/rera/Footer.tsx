'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { reraPath, navLinks, microMarkets } from '@/lib/rera/routes';
import type { ReraShellProps } from '@/types/rera';

interface FooterProps {
  shellProps: ReraShellProps;
}

export const Footer: React.FC<FooterProps> = ({ shellProps }) => {
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const phone = shellProps.phone ?? '';
  const whatsapp = shellProps.whatsapp ?? '';
  const email = shellProps.email ?? '';
  const phoneClean = phone.replace(/\s+/g, '');
  const brokerName = shellProps.brokerName || 'REALSPACE & Arnav Properties';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail.trim()) return;
    setSubscribed(true);
  };

  return (
    <footer className="w-full bg-[#141414] text-[#EEE6DD] border-t border-[#2A2A2A]">
      {/* Top Value Banner */}
      <div className="border-b border-[#2A2A2A] bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-sm bg-[#C8A96A] flex items-center justify-center text-[#1C1C1C] font-bold text-xl shrink-0">
              R
            </div>
            <div>
              <div className="font-heading text-lg font-bold text-white">
                Looking for Exclusive Inventory in Thane?
              </div>
              <p className="text-xs text-[#A39E98] mt-0.5">
                Connect directly with us for off-market builder inventory and bespoke designs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {phone && (
              <a
                href={`tel:${phoneClean}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#1C1C1C] hover:bg-[#EEE6DD] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#C8A96A]" />
                <span>{phone}</span>
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20am%20visiting%20your%20website%20and%20would%20like%20to%20connect.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Direct</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1 & 2: Brand Lockup & Office / Branch Locations */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="font-heading text-2xl font-bold text-white tracking-wide">
                {brokerName}
              </div>
              {shellProps.tagline && (
                <div className="text-xs uppercase tracking-widest text-[#C8A96A] font-medium">
                  {shellProps.tagline}
                </div>
              )}
            </div>

            {/* MahaRERA line — ONLY when non-empty */}
            {shellProps.reraRegistrationNo ? (
              <p className="text-xs text-[#A39E98] leading-relaxed max-w-sm">
                MahaRERA Registered Real Estate Brokerage — Reg. No.{' '}
                <strong className="text-white">{shellProps.reraRegistrationNo}</strong>.
                All project details are sourced from registered developers and public filings.
              </p>
            ) : (
              <p className="text-xs text-[#A39E98] leading-relaxed max-w-sm">
                Licensed real estate brokerage. All project details are sourced from registered
                developers and public filings. Prospective buyers are advised to verify details
                independently.
              </p>
            )}

            {/* Office address */}
            {shellProps.address && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-2 text-[#CCCCCC]">
                  <MapPin className="w-4 h-4 text-[#C8A96A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">Main Office:</strong>
                    <span className="whitespace-pre-line">{shellProps.address}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Published branch list (only when rows exist) */}
            {shellProps.branches.length > 0 && (
              <div className="space-y-3 pt-1 text-xs">
                {shellProps.branches.map((branch) => (
                  <div key={branch.id} className="flex items-start gap-2 text-[#CCCCCC]">
                    <MapPin className="w-4 h-4 text-[#C8A96A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-medium">{branch.name}:</strong>
                      <span className="whitespace-pre-line">{branch.address}</span>
                      {branch.phone && (
                        <a
                          href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                          className="block mt-0.5 text-[#A39E98] hover:text-[#C8A96A] transition-colors"
                        >
                          {branch.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compliance Badge — only when RERA number exists */}
            {shellProps.reraRegistrationNo && (
              <div className="p-3 bg-[#1F1F1F] border border-[#333333] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C8A96A] shrink-0" />
                <div className="text-[11px] text-[#A39E98]">
                  <span className="text-white font-medium">MahaRERA Registration No:</span>{' '}
                  {shellProps.reraRegistrationNo}
                  <div className="text-[10px] text-[#6D6A66]">
                    Verify at maharera.mahaonline.gov.in
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Quick Route Navigation */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-[#2A2A2A] pb-2">
              Navigation
            </div>
            <ul className="space-y-2.5 text-xs text-[#A39E98]">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#0088CC] transition-colors flex items-center gap-1.5"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={reraPath('/services#calculator')}
                  className="hover:text-[#0088CC] transition-colors"
                >
                  EMI CALCULATOR
                </Link>
              </li>
              <li>
                <Link
                  href={reraPath('/about#maharera')}
                  className="hover:text-[#0088CC] transition-colors"
                >
                  MAHARERA CERTIFICATE
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: VIP Property Updates */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-[#2A2A2A] pb-2">
              VIP Property Updates
            </div>
            <p className="text-xs text-[#A39E98] mb-4 leading-relaxed">
              Receive confidential alerts on newly launched developer inventories and price
              revisions in Thane.
            </p>

            {subscribed ? (
              <div className="p-3 bg-[#1F1F1F] border border-[#C8A96A] text-xs text-[#C8A96A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you. You are enrolled for private investor releases.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-[#1F1F1F] border border-[#333333] text-xs text-white focus:outline-none focus:border-[#C8A96A]"
                />
                <button
                  type="submit"
                  className="w-full h-10 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {(email || phone) && (
              <div className="mt-6 pt-4 border-t border-[#2A2A2A] text-xs space-y-1 text-[#A39E98]">
                <div className="text-white font-medium">Customer Support:</div>
                {phone && <div>{phone}</div>}
                {shellProps.altPhone && <div>{shellProps.altPhone}</div>}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="block hover:text-[#C8A96A] transition-colors"
                  >
                    {email}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Regulatory Disclaimer & Copyright Bar */}
        <div className="mt-14 pt-8 border-t border-[#2A2A2A] text-[11px] text-[#777777] leading-relaxed">
          {shellProps.reraRegistrationNo ? (
            <p className="mb-3">
              <strong>MahaRERA Regulatory Disclaimer:</strong> {brokerName} operates as an
              authorized and registered real estate agent under the Real Estate (Regulation and
              Development) Act with Maharashtra Real Estate Regulatory Authority (MahaRERA
              Registration No. {shellProps.reraRegistrationNo}). All project details, prices, and
              amenities mentioned are sourced directly from registered developers and public
              filings. Prospective buyers are advised to verify details independently.
            </p>
          ) : (
            <p className="mb-3">
              <strong>Disclaimer:</strong> {brokerName} is a licensed real estate brokerage. All
              project details, prices, and amenities mentioned are sourced directly from registered
              developers and public filings. Prospective buyers are advised to verify details
              independently.
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#222222]">
            <div>
              © {new Date().getFullYear()} {brokerName}. All rights reserved. Thane, Mumbai.
            </div>
            <div className="flex items-center gap-4 text-[#A39E98]">
              <Link href={reraPath('/about')} className="hover:text-white">
                About Us
              </Link>
              <span>·</span>
              <Link href={reraPath('/services')} className="hover:text-white">
                Services
              </Link>
              <span>·</span>
              <Link href={reraPath('/properties')} className="hover:text-white">
                Properties
              </Link>
              <span>·</span>
              <Link href={reraPath('/contact')} className="hover:text-white">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
