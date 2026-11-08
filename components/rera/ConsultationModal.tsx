'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { submitReraEnquiry } from '@/app/rera/actions';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultInterest?: string;
  propertySlug?: string;
  source?: 'SITE_VISIT' | 'PROPERTY_ENQUIRY';
  phone?: string;
  whatsapp?: string;
  reraRegistrationNo?: string | null;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  defaultInterest = 'Property Site Visit & Valuation',
  propertySlug = '',
  source = 'SITE_VISIT',
  phone = '',
  whatsapp = '',
  reraRegistrationNo,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [serviceInterest, setServiceInterest] = useState(defaultInterest);
  const [preferredLocality, setPreferredLocality] = useState('Ghodbunder Road');
  const [preferredSlot, setPreferredSlot] = useState('Morning (10:00 AM - 01:00 PM)');
  const [customNotes, setCustomNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    if (defaultInterest) {
      setServiceInterest(defaultInterest);
    }
  }, [defaultInterest]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const phoneClean = phone.replace(/\s+/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await submitReraEnquiry({
        name: fullName,
        phone: phoneNumber,
        email: emailAddress,
        interestedIn: 'BUY',
        locality: preferredLocality,
        message: customNotes,
        propertySlug: propertySlug || undefined,
        source: source || 'SITE_VISIT',
        details: {
          serviceInterest,
          preferredSlot,
        },
        honeypot,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Submission failed. Please check your entries.');
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setFullName('');
    setPhoneNumber('');
    setEmailAddress('');
    setCustomNotes('');
    setHoneypot('');
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E8E2DA] shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 text-[#6D6A66] hover:text-[#1C1C1C] transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-[#EEE6DD] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C8A96A]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-[#1C1C1C] mb-2">
              Appointment Request Received
            </h3>
            <p className="text-sm text-[#6D6A66] max-w-sm mx-auto mb-6 leading-relaxed">
              Thank you, <span className="font-semibold text-[#1C1C1C]">{fullName}</span>. Our
              senior advisory desk has logged your site visit request and will reach out to you within
              2 hours.
            </p>

            <div className="p-4 bg-[#F8F5F1] border border-[#E8E2DA] mb-6 text-xs text-left text-[#6D6A66] space-y-1">
              <div>
                <strong className="text-[#1C1C1C]">Service:</strong> {serviceInterest}
              </div>
              <div>
                <strong className="text-[#1C1C1C]">Preferred Slot:</strong> {preferredSlot}
              </div>
              <div>
                <strong className="text-[#1C1C1C]">Preferred Locality:</strong> {preferredLocality}
              </div>
              <div>
                <strong className="text-[#1C1C1C]">Contact Phone:</strong> {phoneNumber}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20just%20submitted%20a%20site%20visit%20request%20for%20${encodeURIComponent(serviceInterest)}%20at%20${encodeURIComponent(preferredLocality)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect on WhatsApp Now</span>
                </a>
              )}
              <button
                onClick={handleResetAndClose}
                className="px-5 py-3 border border-[#E8E2DA] text-[#1C1C1C] hover:bg-[#F8F5F1] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              {reraRegistrationNo && (
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  MahaRERA Registered Broker — Reg. No. {reraRegistrationNo}
                </div>
              )}
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                Schedule VIP Consultation
              </h2>
              <p className="text-xs text-[#6D6A66] mt-1">
                Book a property site visit in Thane or schedule an advisory consultation.
              </p>
            </div>

            {/* Quick Contact Bar */}
            {phone && (
              <div className="flex items-center justify-between p-3 bg-[#F8F5F1] border border-[#E8E2DA] mb-6 text-xs">
                <span className="text-[#6D6A66]">Immediate assistance?</span>
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${phoneClean}`}
                    className="font-semibold text-[#1C1C1C] hover:text-[#C8A96A] flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-[#C8A96A]" />
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {/* Consultation Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="consult_hp_field">Do not fill this</label>
                <input
                  id="consult_hp_field"
                  type="text"
                  name="consult_hp_field"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sunil Kothari"
                  className={`w-full h-11 px-3.5 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                    fieldErrors.name ? 'border-red-500' : 'border-[#E8E2DA]'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="name@domain.com"
                    className={`w-full h-11 px-3.5 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                      fieldErrors.email ? 'border-red-500' : 'border-[#E8E2DA]'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                    Nature of Inquiry
                  </label>
                  <select
                    value={serviceInterest}
                    onChange={(e) => setServiceInterest(e.target.value)}
                    className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                  >
                    <option value="Residential Property Site Visit">
                      Residential Property Site Visit
                    </option>
                    <option value="Commercial Office / Retail Lease">
                      Commercial Office / Retail Lease
                    </option>
                    <option value="REALSPACE Turnkey Luxury Interiors">
                      REALSPACE Turnkey Luxury Interiors
                    </option>
                    <option value="MahaRERA Legal Due Diligence">
                      MahaRERA Legal Due Diligence
                    </option>
                    <option value="Property Resale / Valuation">Property Resale / Valuation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                  Preferred Thane Locality
                </label>
                <select
                  value={preferredLocality}
                  onChange={(e) => setPreferredLocality(e.target.value)}
                  className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                >
                  <option value="Ghodbunder Road">Ghodbunder Road</option>
                  <option value="Majiwada / Viviana Junction">
                    Majiwada / Viviana Junction
                  </option>
                  <option value="Teen Hath Naka / LBS Marg">Teen Hath Naka / LBS Marg</option>
                  <option value="Pokhran Road 1 & 2">Pokhran Road 1 &amp; 2</option>
                  <option value="Kolshet Road">Kolshet Road</option>
                  <option value="Wagle Estate IT Hub">Wagle Estate IT Hub</option>
                  <option value="Kasarvadavli Lake">Kasarvadavli Lake</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                  Specific Requirements or Budget
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Interested in 2 BHK lake view or 45-day turnkey modular kitchen..."
                  className="w-full p-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                />
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] disabled:opacity-60 text-[#1C1C1C] hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <span>Confirm Appointment Request</span>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#A39E98] text-center pt-1">
                Zero spam policy. Your details are solely used for direct consultation.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
