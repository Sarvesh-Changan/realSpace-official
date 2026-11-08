'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitReraEnquiry } from '@/app/rera/actions';

interface ContactFormProps {
  initialPropertySlug?: string;
  initialService?: string;
  whatsapp?: string | null;
}

export function ContactForm({
  initialPropertySlug = '',
  initialService = 'Property Purchase & Site Visit',
  whatsapp = '',
}: ContactFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(initialService);
  const [locality, setLocality] = useState('Ghodbunder Road');
  const [budget, setBudget] = useState('₹75 Lakhs - ₹1.5 Cr');
  const [message, setMessage] = useState('');
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
      let interestedIn: 'BUY' | 'SELL' | 'RENT' | 'OTHER' = 'BUY';
      if (service.toLowerCase().includes('resale') || service.toLowerCase().includes('sell')) {
        interestedIn = 'SELL';
      } else if (service.toLowerCase().includes('rent') || service.toLowerCase().includes('lease')) {
        interestedIn = 'RENT';
      }

      const res = await submitReraEnquiry({
        name,
        phone,
        email,
        interestedIn,
        locality,
        budgetLabel: budget,
        message,
        propertySlug: initialPropertySlug || undefined,
        source: initialPropertySlug ? 'PROPERTY_ENQUIRY' : 'CONTACT_FORM',
        details: {
          serviceRequired: service,
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
          Inquiry Dispatched Successfully
        </h3>
        <p className="text-xs sm:text-sm text-[#6D6A66] max-w-md mx-auto mb-6 leading-relaxed">
          Thank you, <span className="font-semibold text-[#1C1C1C]">{name}</span>. Our senior
          advisory desk has received your requirements for{' '}
          <strong className="text-[#1C1C1C]">{service}</strong>. We will contact you at{' '}
          <strong className="text-[#1C1C1C]">{phone}</strong> shortly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20have%20submitted%20my%20contact%20inquiry%20for%20${encodeURIComponent(service)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Instant WhatsApp Follow-up</span>
            </a>
          )}
          <button
            onClick={() => {
              setIsSubmitted(false);
              setName('');
              setPhone('');
              setEmail('');
              setMessage('');
              setHoneypot('');
            }}
            className="px-6 py-3 border border-[#E8E2DA] text-[#1C1C1C] hover:bg-[#F8F5F1] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Send Another Note
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-[#E8E2DA] pb-4 mb-6">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C8A96A]">
          Direct Inquiry
        </span>
        <h2 className="font-heading text-2xl font-bold text-[#1C1C1C]">
          Send Us Your Property Requirements
        </h2>
        <p className="text-xs text-[#6D6A66] mt-1">
          Fill in the details below and an advisor will coordinate a site visit or consultation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Visually hidden honeypot field for bot filtering */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label htmlFor="contact_hp_field">Do not fill this</label>
          <input
            id="contact_hp_field"
            type="text"
            name="contact_hp_field"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
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
              Mobile Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98XXX XXXXX"
              className={`w-full h-11 px-3.5 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                fieldErrors.phone ? 'border-red-500' : 'border-[#E8E2DA]'
              }`}
            />
            {fieldErrors.phone && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className={`w-full h-11 px-3.5 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
                fieldErrors.email ? 'border-red-500' : 'border-[#E8E2DA]'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Service Required
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            >
              <option value="Property Purchase & Site Visit">Property Purchase &amp; Site Visit</option>
              <option value="Commercial Office / Retail Lease">Commercial Office / Retail Lease</option>
              <option value="Resale & Property Management">Resale &amp; Property Management</option>
              <option value="Home Loan Financing Assistance">Home Loan Financing Assistance</option>
              <option value="MahaRERA Due Diligence">MahaRERA Due Diligence</option>
              <option value="REALSPACE Turnkey Luxury Interiors">
                REALSPACE Turnkey Luxury Interiors
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Preferred Thane Locality
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            >
              <option value="Ghodbunder Road">Ghodbunder Road</option>
              <option value="Majiwada / Lodha Crown">Majiwada / Lodha Crown</option>
              <option value="Teen Hath Naka / LBS Marg">Teen Hath Naka / LBS Marg</option>
              <option value="Pokhran Road 1 & 2">Pokhran Road 1 &amp; 2</option>
              <option value="Kolshet Road">Kolshet Road</option>
              <option value="Wagle Industrial Estate">Wagle Industrial Estate</option>
              <option value="Kasarvadavli Lake">Kasarvadavli Lake</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Estimated Budget
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            >
              <option value="Under ₹80 Lakhs">Under ₹80 Lakhs</option>
              <option value="₹75 Lakhs - ₹1.5 Cr">₹75 Lakhs - ₹1.50 Cr</option>
              <option value="₹1.5 Cr - ₹3.0 Cr">₹1.50 Cr - ₹3.00 Cr</option>
              <option value="Above ₹3.0 Cr (Luxury)">Above ₹3.00 Cr (Luxury)</option>
              <option value="Commercial Lease (Monthly)">Commercial Lease (Monthly)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
            Project Details or Notes
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please mention specific towers, floor preferences, or questions..."
            className={`w-full p-3.5 bg-[#F8F5F1] border text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] ${
              fieldErrors.message ? 'border-red-500' : 'border-[#E8E2DA]'
            }`}
          />
          {fieldErrors.message && (
            <p className="text-[11px] text-red-600 mt-1">{fieldErrors.message[0]}</p>
          )}
        </div>

        {/* Visible Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1 py-4 bg-[#C8A96A] hover:bg-[#B78A47] disabled:opacity-60 text-[#1C1C1C] hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

