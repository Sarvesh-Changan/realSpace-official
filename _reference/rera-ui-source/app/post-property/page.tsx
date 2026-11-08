'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building,
  UploadCloud,
  CheckCircle2,
  Send,
  Phone,
  MessageCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { PropertyValuationTool } from '@/components/PropertyValuationTool';
import { companyData } from '@/data/company';
import { microMarkets, propertyConfigurations } from '@/data/navigation';

export default function PostPropertyPage() {
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [listingType, setListingType] = useState<'sell' | 'rent'>('sell');
  const [propertyCategory, setPropertyCategory] = useState<'residential' | 'commercial'>('residential');
  const [societyName, setSocietyName] = useState('');
  const [microMarket, setMicroMarket] = useState('Majiwada');
  const [bhkConfig, setBhkConfig] = useState('2 BHK');
  const [carpetArea, setCarpetArea] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [furnishing, setFurnishing] = useState('Semi-Furnished');
  const [propertyNotes, setPropertyNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !ownerPhone.trim() || !societyName.trim()) return;
    setIsSubmitted(true);
  };

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. Hero Banner */}
      <section className="bg-[#1C1C1C] text-white py-14 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            MahaRERA: {companyData.reraNumber} · Seller & Landlord Desk
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal leading-tight max-w-3xl mb-4">
            List Your Property in Thane with Arnav Properties.
          </h1>
          <p className="text-xs sm:text-base text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            Get your residential flat, penthouse, or commercial office directly in front of pre-qualified buyers and corporate tenants. Zero upfront marketing fees and professional legal agreement handling.
          </p>
        </div>
      </section>

      {/* 02. Benefits Bar */}
      <section className="border-b border-[#E8E2DA] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
              <span>Pre-Screened Cash & Loan Buyers</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
              <span>Free 4K Walkthrough Video</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
              <span>Registered Agreement by Legal Panel</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
              <span>REALSPACE Staging to Maximize Value</span>
            </div>
          </div>
        </div>
      </section>

      {/* 03. Embedded Instant Valuation Tool */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <PropertyValuationTool />
      </section>

      {/* 04. Property Listing Submission Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
        <div className="bg-white border border-[#E8E2DA] p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
          {isSubmitted ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-[#EEE6DD] text-[#C8A96A] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-[#1C1C1C] mb-2">
                Property Listing Received for Verification
              </h3>
              <p className="text-xs sm:text-sm text-[#6D6A66] max-w-md mx-auto mb-6 leading-relaxed">
                Thank you, <span className="font-semibold text-[#1C1C1C]">{ownerName}</span>. Your property at <strong className="text-[#1C1C1C]">{societyName}, {microMarket}</strong> has been logged in our seller CRM. Vijay Chawan and the inspection team will call you at <strong className="text-[#1C1C1C]">{ownerPhone}</strong> to schedule a complimentary property shoot.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/${companyData.phones.whatsapp}?text=Hi%20Vijay%2C%20I%20have%20submitted%20my%20property%20listing%20at%20${encodeURIComponent(societyName)}%2C%20${encodeURIComponent(microMarket)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect on WhatsApp for Quick Inspection</span>
                </a>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-3 border border-[#E8E2DA] text-[#1C1C1C] hover:bg-[#F8F5F1] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Post Another Property
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="border-b border-[#E8E2DA] pb-4 mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C8A96A]">
                  Step 2 of 2
                </span>
                <h2 className="font-heading text-2xl font-bold text-[#1C1C1C]">
                  Submit Your Property Specifications
                </h2>
                <p className="text-xs text-[#6D6A66] mt-1">
                  Provide your building name and unit details. Our advisors will cross-reference market comps and connect with qualified buyers.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Purpose and Typology */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1.5">
                      I Want To *
                    </label>
                    <div className="flex border border-[#E8E2DA]">
                      <button
                        type="button"
                        onClick={() => setListingType('sell')}
                        className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                          listingType === 'sell'
                            ? 'bg-[#1C1C1C] text-[#C8A96A]'
                            : 'bg-[#F8F5F1] text-[#6D6A66] hover:text-[#1C1C1C]'
                        }`}
                      >
                        Sell Property
                      </button>
                      <button
                        type="button"
                        onClick={() => setListingType('rent')}
                        className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                          listingType === 'rent'
                            ? 'bg-[#1C1C1C] text-[#C8A96A]'
                            : 'bg-[#F8F5F1] text-[#6D6A66] hover:text-[#1C1C1C]'
                        }`}
                      >
                        Rent Out / Lease
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1.5">
                      Property Category *
                    </label>
                    <div className="flex border border-[#E8E2DA]">
                      <button
                        type="button"
                        onClick={() => setPropertyCategory('residential')}
                        className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                          propertyCategory === 'residential'
                            ? 'bg-[#1C1C1C] text-[#C8A96A]'
                            : 'bg-[#F8F5F1] text-[#6D6A66] hover:text-[#1C1C1C]'
                        }`}
                      >
                        Residential Flat
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyCategory('commercial')}
                        className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                          propertyCategory === 'commercial'
                            ? 'bg-[#1C1C1C] text-[#C8A96A]'
                            : 'bg-[#F8F5F1] text-[#6D6A66] hover:text-[#1C1C1C]'
                        }`}
                      >
                        Commercial Space
                      </button>
                    </div>
                  </div>
                </div>

                {/* Society Name & Micro-market */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                      Building or Society Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lodha Crown, Godrej Alive, Rosa Bella..."
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                      Thane Micro-Market *
                    </label>
                    <select
                      value={microMarket}
                      onChange={(e) => setMicroMarket(e.target.value)}
                      className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                    >
                      {microMarkets
                        .filter((m) => m.value !== 'all')
                        .map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* BHK & Carpet Area & Expected Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                      Configuration *
                    </label>
                    <select
                      value={bhkConfig}
                      onChange={(e) => setBhkConfig(e.target.value)}
                      className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                    >
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4+ BHK">4+ BHK / Penthouse</option>
                      <option value="Commercial Office">Commercial Office</option>
                      <option value="Retail Showroom">Retail Showroom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                      Carpet Area (Sq.Ft) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 680"
                      value={carpetArea}
                      onChange={(e) => setCarpetArea(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                      Expected Price (₹) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={listingType === 'sell' ? 'e.g. ₹95 Lakhs' : 'e.g. ₹32,000 / mo'}
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                    />
                  </div>
                </div>

                {/* Owner Information */}
                <div className="pt-2 border-t border-[#E8E2DA]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#1C1C1C] mb-3">
                    Owner / Representative Contact
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Owner name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98XXX XXXXX"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="name@domain.com"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                    Special Features, Floor, or Staging Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Higher floor river view, modular kitchen fitted, ready to hand over immediately..."
                    value={propertyNotes}
                    onChange={(e) => setPropertyNotes(e.target.value)}
                    className="w-full p-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>List My Property with Arnav Properties</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#A39E98] text-center pt-1">
                  MahaRERA Registration No: {companyData.reraNumber}. All seller listings are verified before publishing.
                </p>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
