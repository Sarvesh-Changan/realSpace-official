'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitReraEnquiry } from '@/app/rera/actions';

interface PostPropertyFormProps {
  distinctLocalities?: string[];
  whatsapp?: string | null;
}

export function PostPropertyForm({
  distinctLocalities = [],
  whatsapp = '',
}: PostPropertyFormProps) {
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [listingType, setListingType] = useState<'sell' | 'rent'>('sell');
  const [propertyCategory, setPropertyCategory] = useState<'residential' | 'commercial'>('residential');
  const [societyName, setSocietyName] = useState('');
  const [microMarket, setMicroMarket] = useState(distinctLocalities[0] || 'Majiwada');
  const [bhkConfig, setBhkConfig] = useState('2 BHK');
  const [carpetArea, setCarpetArea] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [furnishing, setFurnishing] = useState('Semi-Furnished');
  const [propertyNotes, setPropertyNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await submitReraEnquiry({
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail,
        interestedIn: listingType === 'rent' ? 'RENT' : 'SELL',
        locality: microMarket,
        budgetLabel: expectedPrice ? `Expected: ${expectedPrice}` : undefined,
        message: propertyNotes,
        source: 'POST_PROPERTY',
        details: {
          listingIntent: listingType,
          propertyCategory,
          societyOrProjectName: societyName,
          bhkConfig,
          carpetAreaSqFt: carpetArea,
          expectedPrice,
          furnishingStatus: furnishing,
        },
        honeypot,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Submission failed. Please check your entries.');
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-[#EEE6DD] text-[#C8A96A] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-[#1C1C1C] mb-2">
          Property Listing Received for Verification
        </h3>
        <p className="text-xs sm:text-sm text-[#6D6A66] max-w-md mx-auto mb-6 leading-relaxed">
          Thank you, <span className="font-semibold text-[#1C1C1C]">{ownerName}</span>. Your property
          details at <strong className="text-[#1C1C1C]">{societyName}, {microMarket}</strong> have been
          logged. Our senior advisory desk will call you at{' '}
          <strong className="text-[#1C1C1C]">{ownerPhone}</strong> to verify the listing and discuss
          onboarding.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20have%20submitted%20my%20property%20listing%20at%20${encodeURIComponent(societyName)}%2C%20${encodeURIComponent(microMarket)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp</span>
            </a>
          )}
          <button
            onClick={() => {
              setIsSubmitted(false);
              setOwnerName('');
              setOwnerPhone('');
              setOwnerEmail('');
              setSocietyName('');
              setCarpetArea('');
              setExpectedPrice('');
              setPropertyNotes('');
              setHoneypot('');
            }}
            className="px-6 py-3 border border-[#E8E2DA] text-[#1C1C1C] hover:bg-[#F8F5F1] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Post Another Property
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-[#E8E2DA] pb-4 mb-6">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C8A96A]">
          Verified Seller &amp; Landlord Listing Form
        </span>
        <h2 className="font-heading text-2xl font-bold text-[#1C1C1C]">
          Submit Your Property Specifications
        </h2>
        <p className="text-xs text-[#6D6A66] mt-1">
          Provide your building name and unit details. Our advisors will cross-reference market comps
          and connect with qualified buyers or corporate tenants.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot field for bot filtering */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label htmlFor="post_hp_field">Do not fill this</label>
          <input
            id="post_hp_field"
            type="text"
            name="post_hp_field"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

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
                Rent / Lease Out
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
                Residential
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
                Commercial
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Dilip Shah"
              className={`w-full h-11 px-3.5 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                fieldErrors.name ? 'border-red-500' : 'border-[#E8E2DA]'
              }`}
            />
            {fieldErrors.name && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              placeholder="+91 98XXX XXXXX"
              className={`w-full h-11 px-3.5 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                fieldErrors.phone ? 'border-red-500' : 'border-[#E8E2DA]'
              }`}
            />
            {fieldErrors.phone && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="owner@domain.com"
              className={`w-full h-11 px-3.5 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                fieldErrors.email ? 'border-red-500' : 'border-[#E8E2DA]'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>
        </div>

        {/* Society & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Building / Society / Project Name *
            </label>
            <input
              type="text"
              required
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              placeholder="e.g. Lodha Amara / Hiranandani Estate"
              className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Thane Locality *
            </label>
            <select
              value={microMarket}
              onChange={(e) => setMicroMarket(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            >
              {distinctLocalities.length > 0 ? (
                distinctLocalities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))
              ) : (
                <>
                  <option value="Majiwada">Majiwada</option>
                  <option value="Ghodbunder Road">Ghodbunder Road</option>
                  <option value="Teen Hath Naka">Teen Hath Naka</option>
                  <option value="Pokhran Road">Pokhran Road</option>
                  <option value="Kolshet Road">Kolshet Road</option>
                  <option value="Wagle Estate">Wagle Estate</option>
                  <option value="Kasarvadavli">Kasarvadavli</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Configuration, Area, Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Configuration
            </label>
            <select
              value={bhkConfig}
              onChange={(e) => setBhkConfig(e.target.value)}
              className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            >
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4+ BHK / Penthouse">4+ BHK / Penthouse</option>
              <option value="Commercial Office Space">Commercial Office Space</option>
              <option value="Retail / Showroom">Retail / Showroom</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Carpet Area (Sq.Ft)
            </label>
            <input
              type="text"
              value={carpetArea}
              onChange={(e) => setCarpetArea(e.target.value)}
              placeholder="e.g. 780"
              className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Expected Price / Monthly Rent
            </label>
            <input
              type="text"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              placeholder="e.g. ₹1.25 Cr or ₹35,000 / mo"
              className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            />
          </div>
        </div>

        {/* Furnishing & Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
            Furnishing Status
          </label>
          <select
            value={furnishing}
            onChange={(e) => setFurnishing(e.target.value)}
            className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
          >
            <option value="Unfurnished / Bare Shell">Unfurnished / Bare Shell</option>
            <option value="Semi-Furnished (Kitchen Cabinets & Wardrobes)">
              Semi-Furnished (Kitchen Cabinets &amp; Wardrobes)
            </option>
            <option value="Fully Furnished (Luxury Custom Interiors)">
              Fully Furnished (Luxury Custom Interiors)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
            Additional Specifications or Availability Timeline
          </label>
          <textarea
            rows={3}
            value={propertyNotes}
            onChange={(e) => setPropertyNotes(e.target.value)}
            placeholder="e.g. Higher floor, road facing, clear title with bank loan NOC ready..."
            className="w-full p-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
          />
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#C8A96A] hover:bg-[#B78A47] disabled:opacity-60 text-[#1C1C1C] hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Listing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Property Listing for Verification</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

