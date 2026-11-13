'use client';

import React, { useState } from 'react';
import { PhoneCall, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitReraEnquiry } from '@/app/rera/actions';

interface CallbackStripProps {
  heading?: string;
  subheading?: string;
  className?: string;
}

export function CallbackStrip({
  heading = 'Request a Quick Callback',
  subheading = 'Share your contact details and enquiry. The REALSPACE team will follow up.',
  className = '',
}: CallbackStripProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await submitReraEnquiry({
        name,
        phone,
        interestedIn: 'BUY',
        source: 'CALLBACK',
        details: {
          actionType: 'Immediate Callback Request',
        },
        honeypot,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Unable to request callback. Please check your entries.');
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setIsSuccess(true);
      }
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`w-full bg-[#1C1C1C] text-white py-12 px-4 sm:px-8 border-y border-[#333333] ${className}`}>
      <div className="max-w-7xl mx-auto">
        {isSuccess ? (
          <div className="bg-[#242424] border border-[#C8A96A] p-6 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-[#333333] rounded-full flex items-center justify-center mx-auto mb-3 text-[#C8A96A]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white mb-1">
              Callback Requested Successfully
            </h3>
            <p className="text-xs text-[#EEE6DD]/80 leading-relaxed max-w-md mx-auto mb-4">
              Thank you, <span className="font-semibold text-white">{name}</span>. Your request has been received. The team will contact you at{' '}
              <strong className="text-[#C8A96A]">{phone}</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setName('');
                setPhone('');
                setHoneypot('');
                setErrorMessage(null);
                setFieldErrors({});
              }}
              className="text-xs text-[#C8A96A] hover:underline uppercase tracking-wider font-semibold"
            >
              Request another callback
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Text Information */}
            <div className="lg:col-span-5 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#C8A96A]">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Instant Advisory</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                {heading}
              </h3>
              <p className="text-xs text-[#A39E98] leading-relaxed max-w-md">
                {subheading}
              </p>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              {errorMessage && (
                <div className="mb-3 p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Honeypot field */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <label htmlFor="callback_hp">Leave this empty</label>
                  <input
                    id="callback_hp"
                    type="text"
                    name="callback_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name *"
                      className={`w-full h-11 px-3.5 bg-[#2A2A2A] border text-xs text-white placeholder-[#777777] focus:outline-none focus:border-[#C8A96A] ${
                        fieldErrors.name ? 'border-red-500' : 'border-[#3D3D3D]'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-[10px] text-red-400 mt-1">{fieldErrors.name[0]}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Mobile (+91...) *"
                      className={`w-full h-11 px-3.5 bg-[#2A2A2A] border text-xs text-white placeholder-[#777777] focus:outline-none focus:border-[#C8A96A] ${
                        fieldErrors.phone ? 'border-red-500' : 'border-[#3D3D3D]'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[10px] text-red-400 mt-1">{fieldErrors.phone[0]}</p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 bg-[#C8A96A] hover:bg-[#B78A47] disabled:bg-[#666666] text-[#1C1C1C] hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Calling...</span>
                        </>
                      ) : (
                        <span>Call Me</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-[#777777] flex items-center gap-2">
                  <span>Enquiry details are used to respond to your request.</span>
                  <span>•</span>
                  <span>REALSPACE</span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

