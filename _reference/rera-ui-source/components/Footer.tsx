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
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { companyData } from '@/data/company';
import { navLinks, footerQuickLinks, microMarkets } from '@/data/navigation';

export const Footer: React.FC = () => {
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
                Looking for Exclusive Inventory or Turnkey Interiors in Thane?
              </div>
              <p className="text-xs text-[#A39E98] mt-0.5">
                Connect directly with founder Vijay Chawan for off-market builder inventory and bespoke designs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${companyData.phones.primary.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#1C1C1C] hover:bg-[#EEE6DD] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#C8A96A]" />
              <span>{companyData.phones.primary}</span>
            </a>
            <a
              href={`https://wa.me/${companyData.phones.whatsapp}?text=Hi%20Vijay%2C%20I%20am%20visiting%20the%20Arnav%20Properties%20website%20and%20would%20like%20to%20connect.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1 & 2: Brand Lockup & Office Locations */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="font-heading text-2xl font-bold text-white tracking-wide">
                REALSPACE
              </div>
              <div className="text-xs uppercase tracking-widest text-[#C8A96A] font-medium">
                & Arnav Properties · Thane, Mumbai
              </div>
            </div>

            <p className="text-xs text-[#A39E98] leading-relaxed max-w-sm">
              MahaRERA Registered Real Estate Brokerage (Reg: {companyData.reraNumber}) and premier luxury interior design firm operating since 2008. Directed by founder Vijay Chawan.
            </p>

            {/* Office Addresses */}
            <div className="space-y-3 pt-2 text-xs">
              {companyData.addresses.map((addr, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[#CCCCCC]">
                  <MapPin className="w-4 h-4 text-[#C8A96A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">{addr.title}:</strong>
                    <span>{addr.line1}, {addr.line2}, {addr.city} - {addr.pin}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance Badge */}
            <div className="p-3 bg-[#1F1F1F] border border-[#333333] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C8A96A] shrink-0" />
              <div className="text-[11px] text-[#A39E98]">
                <span className="text-white font-medium">MahaRERA Registration No:</span> {companyData.reraNumber}
                <div className="text-[10px] text-[#6D6A66]">Verify at maharera.mahaonline.gov.in</div>
              </div>
            </div>
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
                  href="/services#calculator"
                  className="hover:text-[#0088CC] transition-colors"
                >
                  EMI CALCULATOR
                </Link>
              </li>
              <li>
                <Link
                  href="/about#maharera"
                  className="hover:text-[#0088CC] transition-colors"
                >
                  MAHARERA CERTIFICATE
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Micro-Markets Covered */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-[#2A2A2A] pb-2">
              Thane Micro-Markets
            </div>
            <ul className="space-y-2.5 text-xs text-[#A39E98]">
              {microMarkets
                .filter((m) => m.value !== 'all')
                .map((m) => (
                  <li key={m.value}>
                    <Link
                      href={`/properties?microMarket=${encodeURIComponent(m.value)}`}
                      className="hover:text-[#C8A96A] transition-colors flex items-center justify-between"
                    >
                      <span>{m.name}</span>
                      <span className="text-[10px] text-[#6D6A66]">View</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Column 5: Direct Newsletter & Private Sourcing */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-[#2A2A2A] pb-2">
              VIP Property Updates
            </div>
            <p className="text-xs text-[#A39E98] mb-4 leading-relaxed">
              Receive confidential alerts on newly launched developer inventories and price revisions in Thane.
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

            <div className="mt-6 pt-4 border-t border-[#2A2A2A] text-xs space-y-1 text-[#A39E98]">
              <div className="text-white font-medium">Customer Support:</div>
              <div>+91 98336 36699 / +91 98929 36599</div>
              <div>sales@arnavproperties.com</div>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer & Copyright Bar */}
        <div className="mt-14 pt-8 border-t border-[#2A2A2A] text-[11px] text-[#777777] leading-relaxed">
          <p className="mb-3">
            <strong>MahaRERA Regulatory Disclaimer:</strong> Arnav Properties operates as an authorized and registered real estate agent under the Real Estate (Regulation and Development) Act with Maharashtra Real Estate Regulatory Authority (MahaRERA Registration No. A51700001581). All project details, prices, and amenities mentioned are sourced directly from registered developers and public filings. Prospective buyers are advised to verify details independently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#222222]">
            <div>
              © {new Date().getFullYear()} REALSPACE & Arnav Properties. All rights reserved. Thane, Mumbai.
            </div>
            <div className="flex items-center gap-4 text-[#A39E98]">
              <Link href="/about" className="hover:text-white">About Us</Link>
              <span>·</span>
              <Link href="/services" className="hover:text-white">Services</Link>
              <span>·</span>
              <Link href="/properties" className="hover:text-white">Properties</Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
