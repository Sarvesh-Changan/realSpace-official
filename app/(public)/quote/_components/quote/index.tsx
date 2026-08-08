'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { QuoteState, QuoteCalculationResult } from './types';
import Step1BHK from './Step1BHK';
import Step2Rooms from './Step2Rooms';
import Step3Package from './Step3Package';
import Step4Quote from './Step4Quote';
import { submitQuoteAction } from '@/app/(public)/quote/actions';

const STEPS = [
  'BHK TYPE',
  'ROOMS TO DESIGN',
  'PACKAGE',
  'GET QUOTE'
];

const INITIAL_STATE: QuoteState = {
  bhkType: '',
  rooms: { kitchens: 0, livingRooms: 0, bedrooms: 0, bathrooms: 0, wardrobes: 0 },
  requirements: { interior: false, exterior: false },
  packageTier: '',
  additionalServices: [],
  contact: { name: '', phone: '', email: '', location: '', requirements: '', websiteUrl: '' }
};

export default function QuoteCalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [state, setState] = useState<QuoteState>(INITIAL_STATE);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationResult, setCalculationResult] = useState<QuoteCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateState = (updates: Partial<QuoteState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number) => {
    if (step === 1) return !!state.bhkType;
    if (step === 2) {
      const hasRooms = Object.values(state.rooms).some(val => val > 0);
      const hasReqs = state.requirements.interior || state.requirements.exterior;
      return hasRooms || hasReqs;
    }
    if (step === 3) return !!state.packageTier;
    return true;
  };

  const nextStep = () => {
    if (currentStep < 4 && validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await submitQuoteAction(state);
      if (!res.success) {
        setError(res.error || 'Failed to calculate quote estimate. Please try again.');
        setIsSubmitting(false);
        return;
      }
      if (res.data) {
        setCalculationResult(res.data);
      }
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting quote action:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 text-center border border-[#E8E2DA] shadow-sm">
        <div className="w-16 h-16 bg-[#C8A96A]/10 text-[#C8A96A] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-serif text-[#1C1C1C] mb-3">Quote Request Submitted</h2>
        <p className="text-[#6D6A66] max-w-lg mx-auto leading-relaxed mb-8">
          Thank you, <span className="font-semibold text-[#1C1C1C]">{state.contact.name || 'there'}</span>. 
          Here is your real-time calculated estimate range based on active database pricing.
        </p>

        {calculationResult && (
          <div className="max-w-2xl mx-auto bg-[#F8F5F1] p-6 md:p-8 rounded-2xl border border-[#E8E2DA] text-left mb-8 space-y-6">
            <div>
              <div className="text-[#C8A96A] font-medium tracking-wider text-xs uppercase mb-1">Calculated Budget Range</div>
              <div className="text-3xl md:text-4xl font-serif text-[#1C1C1C]">
                {formatCurrency(calculationResult.estimatedBudgetLow)} – {formatCurrency(calculationResult.estimatedBudgetHigh)}
              </div>
            </div>

            {calculationResult.breakdown && calculationResult.breakdown.length > 0 && (
              <div className="pt-4 border-t border-[#E8E2DA] space-y-3">
                <h4 className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Itemized Cost Breakdown</h4>
                <ul className="space-y-2">
                  {calculationResult.breakdown.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span className="text-[#6D6A66]">{item.label}</span>
                      <span className="font-medium text-[#1C1C1C]">{formatCurrency(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-[#6D6A66] italic max-w-lg mx-auto">
          * Our design team will review your selections and contact you at {state.contact.phone} shortly to discuss fine details and exact site measurements.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Progress Bar Header */}
      <div className="mb-12">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 relative">
          {/* Connecting Line (hidden on very small screens) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-[#E8E2DA] -z-10 -translate-y-1/2" />
          
          {STEPS.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isPast = stepNumber < currentStep;
            
            return (
              <div key={label} className="flex flex-col items-center flex-1 z-10">
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors mb-3",
                  isActive ? "bg-[#C8A96A] text-white ring-4 ring-[#C8A96A]/20" : 
                  isPast ? "bg-[#1C1C1C] text-white" : "bg-[#F8F5F1] text-[#6D6A66] border border-[#E8E2DA]"
                )}>
                  {isPast ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : stepNumber}
                </div>
                <span className={clsx(
                  "text-xs tracking-wider font-semibold uppercase text-center hidden sm:block",
                  isActive ? "text-[#1C1C1C]" : isPast ? "text-[#1C1C1C]" : "text-[#6D6A66]"
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Area */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#E8E2DA] shadow-sm relative overflow-hidden min-h-[500px] flex flex-col">
        <div className="flex-1 relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              {currentStep === 1 && <Step1BHK state={state} updateState={updateState} />}
              {currentStep === 2 && <Step2Rooms state={state} updateState={updateState} />}
              {currentStep === 3 && <Step3Package state={state} updateState={updateState} />}
              {currentStep === 4 && (
                <Step4Quote 
                  state={state} 
                  updateState={updateState} 
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  error={error}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation (Hide Next on Step 4 since submit is inside the form) */}
        <div className="mt-12 flex items-center justify-between pt-6 border-t border-[#E8E2DA]">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className={clsx(
              "flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-colors",
              currentStep === 1 ? "opacity-0 pointer-events-none" : "text-[#6D6A66] hover:bg-[#F8F5F1]"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          {currentStep < 4 && (
            <button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="flex items-center gap-2 bg-[#1C1C1C] hover:bg-black disabled:opacity-50 disabled:hover:bg-[#1C1C1C] text-white px-8 py-3 rounded-lg font-medium transition-all"
            >
              Next Step
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

