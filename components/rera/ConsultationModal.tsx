'use client';

import React, { useEffect, useState } from 'react';
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
import { DualOtpContactFields } from './DualOtpContactFields';
import { LocationCascade } from './LocationCascade';
import {
  ALL_CITIES_VALUE,
  ALL_LOCALITIES_VALUE,
  ALL_REGIONS_VALUE,
  formatReraEnquiryLocation,
} from '@/lib/rera/locations';

const CONSULTATION_DRAFT_KEY = 'rera-consultation-modal-draft';

type ConsultationDraft = {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  verificationChallengeId: string;
  verification: { phone: boolean; email: boolean };
  serviceInterest: string;
  preferredRegion: string;
  preferredCity: string;
  preferredLocality: string;
  preferredSlot: string;
  customNotes: string;
};

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
  phone = '',
  whatsapp = '',
  reraRegistrationNo,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [verificationChallengeId, setVerificationChallengeId] = useState('');
  const [verification, setVerification] = useState({ phone: false, email: false });
  const [serviceInterest, setServiceInterest] = useState(defaultInterest);
  const [preferredRegion, setPreferredRegion] = useState('Mumbai Metropolitan Region (MMR)');
  const [preferredCity, setPreferredCity] = useState('Thane');
  const [preferredLocality, setPreferredLocality] = useState('Ghodbunder Road');
  const [preferredSlot, setPreferredSlot] = useState('Morning (10:00 AM - 01:00 PM)');
  const [customNotes, setCustomNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  useEffect(() => {
    try {
      const storedDraft = sessionStorage.getItem(CONSULTATION_DRAFT_KEY);
      if (storedDraft) {
        const draft = JSON.parse(storedDraft) as Partial<ConsultationDraft>;
        if (typeof draft.fullName === 'string') setFullName(draft.fullName);
        if (typeof draft.phoneNumber === 'string') setPhoneNumber(draft.phoneNumber);
        if (typeof draft.emailAddress === 'string') setEmailAddress(draft.emailAddress);
        if (typeof draft.verificationChallengeId === 'string') setVerificationChallengeId(draft.verificationChallengeId);
        if (draft.verification && typeof draft.verification.phone === 'boolean' && typeof draft.verification.email === 'boolean') {
          setVerification(draft.verification);
        }
        if (typeof draft.serviceInterest === 'string') setServiceInterest(draft.serviceInterest);
        if (typeof draft.preferredRegion === 'string') setPreferredRegion(draft.preferredRegion);
        if (typeof draft.preferredCity === 'string') setPreferredCity(draft.preferredCity);
        if (typeof draft.preferredLocality === 'string') setPreferredLocality(draft.preferredLocality);
        if (typeof draft.preferredSlot === 'string') setPreferredSlot(draft.preferredSlot);
        if (typeof draft.customNotes === 'string') setCustomNotes(draft.customNotes);
      }
    } catch {
      try {
        sessionStorage.removeItem(CONSULTATION_DRAFT_KEY);
      } catch {
        // Ignore storage cleanup failures.
      }
    }
    setHasRestoredDraft(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !hasRestoredDraft) return;
    const draft: ConsultationDraft = {
      fullName,
      phoneNumber,
      emailAddress,
      verificationChallengeId,
      verification,
      serviceInterest,
      preferredRegion,
      preferredCity,
      preferredLocality,
      preferredSlot,
      customNotes,
    };
    try {
      sessionStorage.setItem(CONSULTATION_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Form completion should still work if session storage is unavailable.
    }
  }, [isOpen, hasRestoredDraft, fullName, phoneNumber, emailAddress, verificationChallengeId, verification, serviceInterest, preferredRegion, preferredCity, preferredLocality, preferredSlot, customNotes]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const phoneClean = phone.replace(/\s+/g, '');
  const preferredLocationLabel = formatReraEnquiryLocation(preferredRegion, preferredCity, preferredLocality);

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
        locality: preferredLocationLabel,
        message: customNotes,
        propertySlug: propertySlug || undefined,
        source: 'SITE_VISIT',
        verificationChallengeId,
        details: {
          serviceInterest,
          preferredSlot,
          preferredRegion,
          preferredCity,
          preferredLocality,
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
        try {
          sessionStorage.removeItem(CONSULTATION_DRAFT_KEY);
        } catch {
          // Submission should not be marked as failed if draft cleanup is unavailable.
        }
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
    setVerificationChallengeId('');
    setVerification({ phone: false, email: false });
    setServiceInterest(defaultInterest);
    setPreferredRegion('Mumbai Metropolitan Region (MMR)');
    setPreferredCity('Thane');
    setPreferredLocality('Ghodbunder Road');
    setPreferredSlot('Morning (10:00 AM - 01:00 PM)');
    setCustomNotes('');
    setHoneypot('');
    setErrorMessage(null);
    setFieldErrors({});
    try {
      sessionStorage.removeItem(CONSULTATION_DRAFT_KEY);
    } catch {
      // Ignore storage cleanup failures when closing the modal.
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 px-2 py-[5dvh] backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:px-4"
      onClick={handleResetAndClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
        className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto overscroll-contain border border-[#E8E2DA] bg-[#FFFFFF] px-4 py-3 shadow-2xl sm:px-8 sm:py-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center text-[#6D6A66] transition-colors hover:text-[#1C1C1C] sm:right-4 sm:top-4"
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
              team has received your appointment request and will contact you to confirm a time. This
              request is not a confirmed site visit.
            </p>

            <div className="p-4 bg-[#F8F5F1] border border-[#E8E2DA] mb-6 text-xs text-left text-[#6D6A66] space-y-1">
              <div>
                <strong className="text-[#1C1C1C]">Service:</strong> {serviceInterest}
              </div>
              <div>
                <strong className="text-[#1C1C1C]">Preferred Slot:</strong> {preferredSlot}
              </div>
              <div>
                <strong className="text-[#1C1C1C]">Preferred Location:</strong> {preferredLocationLabel}
              </div>
              <div>
                <strong className="text-[#1C1C1C]">Contact Phone:</strong> {phoneNumber}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20just%20submitted%20a%20site%20visit%20request%20for%20${encodeURIComponent(serviceInterest)}%20at%20${encodeURIComponent(preferredLocationLabel)}.`}
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
            <div className="mb-3 pr-12 sm:pr-14">
              {reraRegistrationNo && (
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  MahaRERA Registered Broker — Reg. No. {reraRegistrationNo}
                </div>
              )}
              <h2 id="consultation-modal-title" className="break-words font-heading text-lg font-bold leading-snug text-[#1C1C1C] sm:text-3xl">
                Schedule VIP Consultation
              </h2>
              <p className="text-xs text-[#6D6A66] mt-1">
                Book a property site visit in Thane or schedule an advisory consultation.
              </p>
            </div>

            {/* Quick Contact Bar */}
            {phone && (
              <div className="flex items-center justify-between p-3 bg-[#F8F5F1] border border-[#E8E2DA] mb-3 text-xs">
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
            <form onSubmit={handleSubmit} className="space-y-3">
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
                <div className="sm:col-span-2">
                  <DualOtpContactFields formType="consultation" phone={phoneNumber} email={emailAddress} onPhoneChange={setPhoneNumber} onEmailChange={setEmailAddress} onChallengeIdChange={setVerificationChallengeId} onVerificationChange={setVerification} />
                  {fieldErrors.phone && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone[0]}</p>}
                  {fieldErrors.email && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email[0]}</p>}
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
                    <option value="Home Loan">
                      Home Loan
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

              <LocationCascade
                variant="filter"
                region={preferredRegion}
                city={preferredCity}
                locality={preferredLocality}
                onRegionChange={(nextRegion) => {
                  setPreferredRegion(nextRegion || ALL_REGIONS_VALUE);
                  setPreferredCity(ALL_CITIES_VALUE);
                  setPreferredLocality(ALL_LOCALITIES_VALUE);
                }}
                onCityChange={(nextCity) => {
                  setPreferredCity(nextCity || ALL_CITIES_VALUE);
                  setPreferredLocality(ALL_LOCALITIES_VALUE);
                }}
                onLocalityChange={setPreferredLocality}
                localityLabel="Preferred Locality (optional)"
                includeAllCities
                includeAllLocalities
              />

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

              <div className="sticky bottom-0 -mx-4 border-t border-[#E8E2DA] bg-white px-4 pb-1 pt-3 sm:-mx-8 sm:px-8">
                <button
                  type="submit"
                  disabled={isSubmitting || !verification.phone || !verification.email}
                  className="flex min-h-11 w-full items-center justify-center gap-2 bg-[#C8A96A] py-3.5 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] shadow-md transition-colors hover:bg-[#B78A47] hover:text-white disabled:opacity-60"
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
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
