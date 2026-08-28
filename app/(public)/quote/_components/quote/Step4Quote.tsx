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
  const isCommercialFlow =
    (state as any).isCommercialFlow ?? (state.bhkType === 'Commercial & Others');

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

  const commercialData = {
    businessType: (state as any).businessType,
    approxAreaSqft: (state as any).approxAreaSqft,
    description: state.spaceDescription || (state as any).description,
    budgetRangeLabel: (state as any).budgetRangeLabel,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
      {/* Left Column: Selections Summary & Estimate Info */}
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-[#1C1C1C] mb-2">Review Selections & Get Quote</h2>
          <p className="text-sm sm:text-base text-[#6D6A66]">
            {isCommercialFlow
              ? 'Review your commercial space qualification details and provide contact information to receive your custom proposal.'
              : 'Provide your details to calculate your instant estimated budget range powered by our active pricing database.'}
          </p>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F5F1] rounded-xl sm:rounded-2xl border border-[#E8E2DA] space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-xs font-bold text-[#C8A96A] tracking-wider uppercase mb-3">
              {isCommercialFlow ? 'Commercial Qualification Summary' : 'Selected Configuration'}
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-[#1C1C1C]">
              {state.bhkType && (
                <div className="flex justify-between border-b border-[#E8E2DA] pb-2 gap-2">
                  <span className="text-[#6D6A66]">Property Type</span>
                  <span className="font-semibold text-right">{state.bhkType}</span>
                </div>
              )}

              {isCommercialFlow ? (
                <>
                  {commercialData.businessType && (
                    <div className="flex justify-between border-b border-[#E8E2DA] pb-2 gap-2">
                      <span className="text-[#6D6A66]">Business / Space Type</span>
                      <span className="font-semibold text-right">{commercialData.businessType}</span>
                    </div>
                  )}
                  {commercialData.approxAreaSqft && (
                    <div className="flex justify-between border-b border-[#E8E2DA] pb-2 gap-2">
                      <span className="text-[#6D6A66]">Approximate Area</span>
                      <span className="font-semibold text-right">{commercialData.approxAreaSqft} sq ft</span>
                    </div>
                  )}
                  {commercialData.budgetRangeLabel && (
                    <div className="flex justify-between border-b border-[#E8E2DA] pb-2 gap-2">
                      <span className="text-[#6D6A66]">Rough Budget Range</span>
                      <span className="font-semibold text-right">{commercialData.budgetRangeLabel}</span>
                    </div>
                  )}
                  {commercialData.description && (
                    <div className="pt-1">
                      <span className="text-[#6D6A66] block mb-1">Description</span>
                      <p className="font-medium text-[#1C1C1C] whitespace-pre-wrap">{commercialData.description}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {state.packageTier && (
                    <div className="flex justify-between border-b border-[#E8E2DA] pb-2 gap-2">
                      <span className="text-[#6D6A66]">Package Tier</span>
                      <span className="font-semibold text-right">{state.packageTier}</span>
                    </div>
                  )}
                  {selectedRoomSummary.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[#6D6A66] block mb-1">Rooms to Design</span>
                      <span className="font-medium">{selectedRoomSummary.join(', ')}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-[#E8E2DA]">
            <p className="text-xs sm:text-sm text-[#6D6A66] leading-relaxed">
              {isCommercialFlow
                ? 'Commercial and specialty spaces are unique — every project is different. Our team will review your requirements and follow up with a detailed, custom quote within 24–48 hours.'
                : 'Upon submission, our server calculates an estimated low/high budget range using real-time configured option rates and creates a lead for our team.'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Contact Form */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-[#E8E2DA] shadow-sm">
        <h3 className="text-lg sm:text-xl font-serif text-[#1C1C1C] mb-4 sm:mb-6">Enter Contact Details</h3>
        
        {error && (
          <div className="mb-4 p-3.5 sm:p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-lg">
            {error}
          </div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          className="space-y-3.5 sm:space-y-4"
        >
          {/* Honeypot field */}
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
            <label className="block text-xs sm:text-sm font-medium text-[#1C1C1C] mb-1">Full Name *</label>
            <input 
              required
              name="name"
              value={state.contact.name}
              onChange={handleInputChange}
              type="text" 
              className="w-full min-h-[44px] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors text-base sm:text-sm"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#1C1C1C] mb-1">Phone Number *</label>
              <input 
                required
                name="phone"
                value={state.contact.phone}
                onChange={handleInputChange}
                type="tel" 
                className="w-full min-h-[44px] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors text-base sm:text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#1C1C1C] mb-1">Email Address *</label>
              <input 
                required
                name="email"
                value={state.contact.email}
                onChange={handleInputChange}
                type="email" 
                className="w-full min-h-[44px] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors text-base sm:text-sm"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#1C1C1C] mb-1">Property Location</label>
            <input 
              name="location"
              value={state.contact.location}
              onChange={handleInputChange}
              type="text" 
              className="w-full min-h-[44px] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors text-base sm:text-sm"
              placeholder="e.g. Majiwada, Thane"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#1C1C1C] mb-1">Specific Requirements</label>
            <textarea 
              name="requirements"
              value={state.contact.requirements}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-[#E8E2DA] focus:border-[#C8A96A] focus:ring-1 focus:ring-[#C8A96A] outline-none transition-colors text-base sm:text-sm resize-none"
              placeholder="Tell us a bit more about your vision..."
            />
          </div>

          {/* Email OTP Verification Component */}
          <div className="pt-3.5 sm:pt-4 border-t border-[#E8E2DA]">
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
            className="w-full mt-4 min-h-[50px] bg-[#C8A96A] hover:bg-[#B78A47] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 sm:py-4 rounded-lg transition-colors flex justify-center items-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isCommercialFlow ? 'Submitting Request...' : 'Calculating Estimate...'}</span>
              </>
            ) : (
              <span>{isCommercialFlow ? 'Submit Quote Request' : 'Submit & Calculate Estimate'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


