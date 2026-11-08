'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { submitReraEnquiry } from '@/app/rera/actions';

interface PropertyBookingCardProps {
  propertySlug: string;
  propertyTitle: string;
  priceLabel: string;
  priceAmount?: number | null;
  carpetAreaSqFt?: number | null;
  phone?: string | null;
  whatsapp?: string | null;
}

export function PropertyBookingCard({
  propertySlug,
  propertyTitle,
  priceLabel,
  priceAmount,
  carpetAreaSqFt,
  phone = '',
  whatsapp = '',
}: PropertyBookingCardProps) {
  const [activeTab, setActiveTab] = useState<'site_visit' | 'enquire'>('site_visit');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Morning (10:00 AM - 01:00 PM)');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const phoneClean = (phone ?? '').replace(/\s+/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const isSiteVisit = activeTab === 'site_visit';
      const res = await submitReraEnquiry({
        name,
        phone: phoneNumber,
        email,
        interestedIn: 'BUY',
        message,
        propertySlug,
        source: isSiteVisit ? 'SITE_VISIT' : 'PROPERTY_ENQUIRY',
        details: isSiteVisit
          ? {
              actionType: 'Site Visit Booking',
              preferredSlot,
              propertyTitle,
            }
          : {
              actionType: 'General Property Enquiry',
              propertyTitle,
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

  return (
    <div className="bg-white border border-[#E8E2DA] p-6 shadow-sm space-y-4">
      <div className="border-b border-[#E8E2DA] pb-4">
        <div className="text-[10px] uppercase tracking-wider text-[#A39E98] font-bold">
          Quoted Pricing
        </div>
        <div className="font-heading text-3xl font-bold text-[#1C1C1C] mt-0.5">
          {priceLabel}
        </div>
        {priceAmount && carpetAreaSqFt ? (
          <div className="text-xs text-[#6D6A66] mt-1">
            Carpet Rate: ~₹
            {Math.round(priceAmount / carpetAreaSqFt).toLocaleString('en-IN')}{' '}
            / sq.ft
          </div>
        ) : null}
      </div>

      {isSubmitted ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 bg-[#EEE6DD] text-[#C8A96A] rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-heading text-lg font-bold text-[#1C1C1C] mb-1">
            {activeTab === 'site_visit' ? 'Site Visit Requested' : 'Enquiry Received'}
          </h4>
          <p className="text-xs text-[#6D6A66] leading-relaxed mb-4">
            Thank you, <span className="font-semibold text-[#1C1C1C]">{name}</span>. Our advisory
            desk will reach out to you at <strong className="text-[#1C1C1C]">{phoneNumber}</strong>{' '}
            shortly.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setName('');
              setPhoneNumber('');
              setEmail('');
              setMessage('');
              setHoneypot('');
            }}
            className="text-xs text-[#C8A96A] hover:underline font-semibold uppercase tracking-wider"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <div>
          {/* Segmented Switcher */}
          <div className="flex border border-[#E8E2DA] mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('site_visit')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'site_visit'
                  ? 'bg-[#1C1C1C] text-[#C8A96A]'
                  : 'bg-[#F8F5F1] text-[#6D6A66] hover:text-[#1C1C1C]'
              }`}
            >
              Book Site Visit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('enquire')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'enquire'
                  ? 'bg-[#1C1C1C] text-[#C8A96A]'
                  : 'bg-[#F8F5F1] text-[#6D6A66] hover:text-[#1C1C1C]'
              }`}
            >
              Enquire
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Honeypot field */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="booking_hp_field">Do not fill this</label>
              <input
                id="booking_hp_field"
                type="text"
                name="booking_hp_field"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1C1C] mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunil Mehta"
                className={`w-full h-10 px-3 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                  fieldErrors.name ? 'border-red-500' : 'border-[#E8E2DA]'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1C1C] mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className={`w-full h-10 px-3 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                  fieldErrors.phone ? 'border-red-500' : 'border-[#E8E2DA]'
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.phone[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1C1C] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className={`w-full h-10 px-3 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                  fieldErrors.email ? 'border-red-500' : 'border-[#E8E2DA]'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.email[0]}</p>
              )}
            </div>

            {activeTab === 'site_visit' && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1C1C] mb-1">
                  Preferred Slot
                </label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                >
                  <option value="Morning (10:00 AM - 01:00 PM)">
                    Morning (10:00 AM - 01:00 PM)
                  </option>
                  <option value="Afternoon (01:00 PM - 04:00 PM)">
                    Afternoon (01:00 PM - 04:00 PM)
                  </option>
                  <option value="Evening (04:00 PM - 07:30 PM)">
                    Evening (04:00 PM - 07:30 PM)
                  </option>
                  <option value="Weekend Priority Slot">Weekend Priority Slot</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1C1C] mb-1">
                {activeTab === 'site_visit' ? 'Specific Requirements' : 'Questions or Comments'}
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Looking for higher floor or 30-day possession..."
                className="w-full p-2.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
              />
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] disabled:opacity-60 text-[#1C1C1C] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {activeTab === 'site_visit' ? 'Confirm Site Visit Booking' : 'Send Enquiry'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Direct Contact Links */}
      <div className="space-y-2 pt-2 border-t border-[#E8E2DA]">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20am%20viewing%20the%20property%20listing%20for%20${encodeURIComponent(propertyTitle)}%20(${encodeURIComponent(priceLabel)}).%20Please%20send%20brochure%20and%20details.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        )}

        {phoneClean && (
          <a
            href={`tel:${phoneClean}`}
            className="w-full py-2.5 bg-[#1C1C1C] hover:bg-[#C8A96A] text-[#C8A96A] hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Us: {phone}</span>
          </a>
        )}
      </div>

      <div className="pt-2 text-[11px] text-[#6D6A66] space-y-1">
        <div>✓ Verified statutory RERA documentation</div>
        <div>✓ Accompanied site visit support in Thane</div>
        <div>✓ Zero spam commitment</div>
      </div>
    </div>
  );
}
