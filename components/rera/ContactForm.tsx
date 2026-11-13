'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitReraEnquiry } from '@/app/rera/actions';

interface ContactFormProps {
  initialPropertySlug?: string;
  initialService?: string;
  whatsapp?: string | null;
  services?: string[];
  localities?: string[];
}

export function ContactForm({
  initialPropertySlug = '',
  initialService = '',
  whatsapp = '',
  services = [],
  localities = [],
}: ContactFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(initialService);
  const [locality, setLocality] = useState('');
  const [budget, setBudget] = useState('');
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
          Enquiry received
        </h3>
        <p className="text-xs sm:text-sm text-[#6D6A66] max-w-md mx-auto mb-6 leading-relaxed">
          Thank you, <span className="font-semibold text-[#1C1C1C]">{name}</span>. Your enquiry
          has been saved. This confirms that it was stored; email notification is handled
          separately and is not guaranteed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I have submitted my contact enquiry${service ? ` for ${service}` : ''}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Continue on WhatsApp</span>
            </a>
          )}
          <button
            onClick={() => {
              setIsSubmitted(false);
              setName('');
              setPhone('');
              setEmail('');
              setService('');
              setLocality('');
              setBudget('');
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
          Contact REALSPACE
        </span>
        <h2 className="font-heading text-2xl font-bold text-[#1C1C1C]">
          Send an Enquiry
        </h2>
        <p className="text-xs text-[#6D6A66] mt-1">
          Complete the form and submit your enquiry.
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
              Service (optional)
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            >
              <option value="">Select a service (optional)</option>
              {services.map((title) => <option key={title} value={title}>{title}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Locality (optional)
            </label>
            {localities.length > 0 ? (
              <select value={locality} onChange={(e) => setLocality(e.target.value)} className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]">
                <option value="">Select a locality (optional)</option>
                {localities.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            ) : (
              <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)} maxLength={100} placeholder="Enter a locality (optional)" className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]" />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
              Budget (optional)
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              maxLength={100}
              placeholder="Enter a budget (optional)"
              className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            />
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
            placeholder="Add any details or questions (optional)"
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
                <span>Send Enquiry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

