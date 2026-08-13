import React, { useMemo } from 'react';
import { QuoteState } from './types';
import { OtpVerification } from './OtpVerification';
import { sendOtp as sendOtpAction, checkOtp as checkOtpAction } from '@/app/(public)/quote/otp-actions';

interface Props {
  state: QuoteState;
  updateState: (updates: Partial<QuoteState>) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export default function Step4Quote({ state, updateState, onSubmit, isSubmitting = false, error }: Props) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'email' && value !== state.contact.email) {
      updateState({ contact: { ...state.contact, email: value, verifiedToken: '' } });
    } else {
      updateState({ contact: { ...state.contact, [name]: value } });
    }
  };

  const handleSendOtp = async (email: string) => {
    const res = await sendOtpAction(email);
    if (!res.success) {
      throw new Error(res.error || 'Failed to send verification code.');
    }
    return true;
  };

  const handleCheckOtp = async (email: string, code: string) => {
    const res = await checkOtpAction(email, code);
    return {
      success: res.success,
      token: res.verifiedToken,
      error: res.error,
    };
  };

  const handleOtpVerified = (token: string, verifiedEmail: string) => {
    updateState({
      contact: {
        ...state.contact,
        email: verifiedEmail,
        verifiedToken: token,
      },
    });
  };

  const selectedRoomSummary = Object.entries(state.rooms)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      return `${count}x ${formattedKey}`;
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Column: Selections Summary & Estimate Info */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-serif text-[#1C1C1C] mb-2">Review Selections & Get Quote</h2>
          <p className="text-[#6D6A66]">
            Provide your details to calculate your instant estimated budget range powered by our active pricing database.
          </p>
        </div>

        <div className="p-8 bg-[#F8F5F1] rounded-2xl border border-[#E8E2DA] space-y-6">
          <div>
            <h3 className="text-xs font-bold text-[#C8A96A] tracking-wider uppercase mb-3">Selected Configuration</h3>
            <div className="space-y-2 text-sm text-[#1C1C1C]">
              {state.bhkType && (
                <div className="flex justify-between border-b border-[#E8E2DA] pb-2">
                  <span className="text-[#6D6A66]">Property Type</span>
                  <span className="font-semibold">{state.bhkType}</span>
                </div>
              )}
              {state.packageTier && (
                <div className="flex justify-between border-b border-[#E8E2DA] pb-2">
                  <span className="text-[#6D6A66]">Package Tier</span>
                  <span className="font-semibold">{state.packageTier}</span>
                </div>
              )}
              {selectedRoomSummary.length > 0 && (
                <div className="border-b border-[#E8E2DA] pb-2">
                  <span className="text-[#6D6A66] block mb-1">Rooms to Design</span>
                  <span className="font-medium">{selectedRoomSummary.join(', ')}</span>
                </div>
              )}
              {state.additionalServices.length > 0 && (
                <div className="pt-1">
                  <span className="text-[#6D6A66] block mb-1">Additional Services</span>
                  <span className="font-medium">{state.additionalServices.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2DA]">
            <p className="text-xs text-[#6D6A66] leading-relaxed">
              Upon submission, our server calculates an estimated low/high budget range using real-time configured option rates and creates a lead for our team.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Contact Form */}
      <div className="bg-white p-8 rounded-2xl border border-[#E8E2DA] shadow-sm">
        <h3 className="text-xl font-serif text-[#1C1C1C] mb-6">Enter Contact Details</h3>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          className="space-y-4"
        >
          {/* Honeypot field (hidden from real users, tricks bots) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="websiteUrl">Website URL</label>
            <input 
              id="websiteUrl"
              name="websiteUrl"
              value={state.contact.websiteUrl || ''}
              onChange={handleInputChange}
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Full Name *</label>
            <input 
              required
              name="name"
              value={state.contact.name}
              onChange={handleInputChange}
              type="text" 
              className="w-full px-4 py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Phone Number *</label>
              <input 
                required
                name="phone"
                value={state.contact.phone}
                onChange={handleInputChange}
                type="tel" 
                className="w-full px-4 py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Email Address *</label>
              <input 
                required
                name="email"
                value={state.contact.email}
                onChange={handleInputChange}
                type="email" 
                className="w-full px-4 py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Property Location</label>
            <input 
              name="location"
              value={state.contact.location}
              onChange={handleInputChange}
              type="text" 
              className="w-full px-4 py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors"
              placeholder="e.g. Majiwada, Thane"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Specific Requirements</label>
            <textarea 
              name="requirements"
              value={state.contact.requirements}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors resize-none"
              placeholder="Tell us a bit more about your vision..."
            />
          </div>

          {/* Email OTP Verification Component */}
          <div className="pt-4 border-t border-[#E8E2DA]">
            <OtpVerification
              sendOtp={handleSendOtp}
              checkOtp={handleCheckOtp}
              onVerified={handleOtpVerified}
              initialEmail={state.contact.email}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !state.contact.verifiedToken}
            className="w-full mt-4 bg-[#C8A96A] hover:bg-[#B78A47] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Calculating Estimate...</span>
              </>
            ) : (
              <span>Submit & Calculate Estimate</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

