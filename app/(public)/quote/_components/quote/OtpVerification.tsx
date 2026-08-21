"use client";

import React, { useState, useEffect } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";

interface OtpVerificationProps {
  sendOtp: (email: string) => Promise<boolean>;
  checkOtp: (
    email: string,
    code: string
  ) => Promise<{ success: boolean; token?: string; error?: string }>;
  onVerified: (token: string, email: string) => void;
  initialEmail?: string;
}

type Step = "input_email" | "verify_otp" | "verified";

export function OtpVerification({
  sendOtp,
  checkOtp,
  onVerified,
  initialEmail = "",
}: OtpVerificationProps) {
  const [step, setStep] = useState<Step>("input_email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expiresIn, setExpiresIn] = useState(300);
  const [resendIn, setResendIn] = useState(60);
  const [attempts, setAttempts] = useState(0);

  // Timer effect for OTP countdowns
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verify_otp") {
      interval = setInterval(() => {
        setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
        setResendIn((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSendCode = async () => {
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await sendOtp(email);
      if (success) {
        setStep("verify_otp");
        setExpiresIn(300);
        setResendIn(60);
        setAttempts(0);
        setOtp("");
      } else {
        setError("Failed to send verification code. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while sending the code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError(null);
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    if (expiresIn === 0) {
      setError("Verification code has expired. Please request a new one.");
      return;
    }
    if (attempts >= 3) {
      setError("Maximum verification attempts reached. Please request a new code.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await checkOtp(email, otp);
      if (result.success && result.token) {
        setStep("verified");
        onVerified(result.token, email);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setError("Maximum attempts reached. Please resend the code.");
        } else {
          setError(result.error || "Invalid verification code. Please try again.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    handleSendCode();
  };

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1.5 sm:mb-2">
          Email Verification
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
          {step === "input_email"
            ? "To save your estimate and receive a detailed quote, please verify your email address."
            : step === "verify_otp"
            ? `We've sent a 6-digit code to ${email}. Please enter it below.`
            : "Your email has been successfully verified."}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6 flex items-start gap-2.5 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Content Area */}
      <div className="space-y-4 sm:space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${step === "verified" ? "text-green-500" : "text-neutral-400"}`} />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step !== "input_email" || isLoading}
              className={`block w-full pl-9 sm:pl-10 pr-3 py-2.5 rounded-lg border text-base sm:text-sm transition-colors
                ${
                  step === "verified"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : step === "verify_otp"
                    ? "bg-neutral-50 border-neutral-200 text-neutral-500"
                    : "bg-white border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                }
                disabled:opacity-100
              `}
              placeholder="name@example.com"
            />
            {step === "verified" && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
            )}
          </div>
        </div>

        {/* Email Step Actions */}
        {step === "input_email" && (
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isLoading || !email}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-brand-red text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <>
                Send Verification Code
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {/* OTP Step Actions */}
        {step === "verify_otp" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label htmlFor="otp" className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-1.5">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={isLoading || expiresIn === 0 || attempts >= 3}
              className="block w-full text-center tracking-[0.3em] sm:tracking-[0.5em] font-mono text-lg sm:text-2xl py-2.5 sm:py-3 px-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:ring-2 focus:ring-brand-red focus:border-brand-red disabled:bg-neutral-50 disabled:text-neutral-500 transition-colors max-w-full"
              placeholder="••••••"
            />

            <div className="mt-3.5 sm:mt-4 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={isLoading || otp.length !== 6 || expiresIn === 0 || attempts >= 3}
                className="w-full sm:flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-brand-red text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-brand-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  "Verify Code"
                )}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading || resendIn > 0}
                className="w-full sm:flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-white border border-neutral-200 text-neutral-700 py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? "animate-spin" : ""}`} />
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend Code"}
              </button>
            </div>

            <div className="mt-3 sm:mt-4 text-center">
              <span className={`text-xs sm:text-sm font-medium ${expiresIn > 60 ? "text-neutral-500" : "text-brand-yellow"}`}>
                {expiresIn > 0 ? `Code expires in ${formatTime(expiresIn)}` : "Code expired."}
              </span>
            </div>
          </div>
        )}

        {/* Verified Step State */}
        {step === "verified" && (
          <div className="animate-in fade-in zoom-in-95 duration-300 bg-green-50 border border-green-100 rounded-lg p-3.5 sm:p-4 flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 mt-3.5 sm:mt-4">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            <p className="text-green-800 font-medium text-xs sm:text-sm">Email Successfully Verified</p>
            <p className="text-xs text-green-600">You can now proceed with your estimate.</p>
          </div>
        )}
      </div>
    </div>
  );
}
