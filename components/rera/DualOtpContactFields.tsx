'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { confirmReraEmailOtp, sendReraEmailOtp, startReraPhoneVerification } from '@/app/rera/verification/actions';

type Props = {
  formType: 'contact' | 'consultation';
  phone: string;
  email: string;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onChallengeIdChange: (value: string) => void;
  onVerificationChange: (value: { phone: boolean; email: boolean }) => void;
  className?: string;
};

export function DualOtpContactFields({ formType, phone, email, onPhoneChange, onEmailChange, onChallengeIdChange, onVerificationChange, className = '' }: Props) {
  const [challengeId, setChallengeId] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const popupRef = useRef<Window | null>(null);
  const attemptRef = useRef('');
  const phoneDigits = phone.startsWith('+91')
    ? phone.slice(3).replace(/\D/g, '').slice(0, 10)
    : phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '').slice(0, 10);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  // If the provider/browser does not let the verification window close, the
  // callback returns this tab to /rera/contact with the verified challenge.
  useEffect(() => {
    const url = new URL(window.location.href);
    const phoneVerification = url.searchParams.get('phoneVerification');
    if (!phoneVerification) return;

    const returnedChallengeId = url.searchParams.get('challengeId') || '';
    const returnedAttemptId = url.searchParams.get('attemptId') || '';
    const validId = (value: string) => /^[0-9a-f-]{36}$/i.test(value);
    if (phoneVerification === 'complete' && validId(returnedChallengeId) && validId(returnedAttemptId)) {
      try {
        const savedFields = sessionStorage.getItem(`rera-phone-fields:${returnedChallengeId}`);
        if (savedFields) {
          const fields = JSON.parse(savedFields) as { phone?: string; email?: string };
          if (typeof fields.phone === 'string') onPhoneChange(fields.phone);
          if (typeof fields.email === 'string') onEmailChange(fields.email);
          sessionStorage.removeItem(`rera-phone-fields:${returnedChallengeId}`);
        }
      } catch {
        // Verification state can still be restored if saved form fields are unavailable.
      }
      setChallengeId(returnedChallengeId);
      onChallengeIdChange(returnedChallengeId);
      attemptRef.current = returnedAttemptId;
      setPhoneVerified(true);
      setEmailVerified(url.searchParams.get('emailVerification') === 'complete');
      setPhoneBusy(false);
      setError('');
    } else if (phoneVerification === 'failed') {
      setError('Phone verification did not complete. Please try again.');
      setPhoneBusy(false);
    }

    url.searchParams.delete('phoneVerification');
    url.searchParams.delete('emailVerification');
    url.searchParams.delete('challengeId');
    url.searchParams.delete('attemptId');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }, [onChallengeIdChange, onEmailChange, onPhoneChange]);

  useEffect(() => {
    const applyPhoneVerificationResult = (data: { type?: string; challengeId?: string; attemptId?: string; success?: boolean; emailVerified?: boolean }) => {
      if (data?.type !== 'rera-phone-verification' || data.challengeId !== challengeId || data.attemptId !== attemptRef.current) return;
      const verificationPopup = popupRef.current;
      popupRef.current = null;
      setPhoneBusy(false);
      if (data.success) {
        setPhoneVerified(true);
        if (data.emailVerified) setEmailVerified(true);
        if (verificationPopup && !verificationPopup.closed) verificationPopup.close();
      }
      else setError('Phone verification did not complete. Please try again.');
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== popupRef.current) return;
      applyPhoneVerificationResult(event.data as { type?: string; challengeId?: string; attemptId?: string; success?: boolean; emailVerified?: boolean });
    };

    const storageKey = `rera-phone-verification:${challengeId}`;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      let data: { type?: string; challengeId?: string; attemptId?: string; success?: boolean; emailVerified?: boolean };
      try {
        data = JSON.parse(event.newValue) as { type?: string; challengeId?: string; attemptId?: string; success?: boolean };
      } catch {
        setError('Phone verification response could not be read. Please try again.');
        setPhoneBusy(false);
        return;
      }
      applyPhoneVerificationResult(data);
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // The one-time key is unique to this verification challenge.
      }
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('storage', onStorage);
    };
  }, [challengeId]);

  useEffect(() => onVerificationChange({ phone: phoneVerified, email: emailVerified }), [phoneVerified, emailVerified, onVerificationChange]);

  const reset = () => {
    const id = crypto.randomUUID();
    setChallengeId(id);
    onChallengeIdChange(id);
    setPhoneVerified(false);
    setEmailVerified(false);
    setOtp('');
    setOtpSent(false);
    setCooldown(0);
    setError('');
  };

  const handlePhoneChange = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    onPhoneChange(digits ? `+91${digits.slice(0, 10)}` : '');
    reset();
  };
  const handleEmailChange = (value: string) => { onEmailChange(value); reset(); };

  const verifyPhone = async () => {
    setError('');
    const id = challengeId || crypto.randomUUID();
    if (!challengeId) { setChallengeId(id); onChallengeIdChange(id); }
    try { sessionStorage.setItem(`rera-phone-fields:${id}`, JSON.stringify({ phone, email })); } catch { /* Optional form recovery. */ }
    const popup = window.open('about:blank', 'rera-phone-verification', 'popup,width=480,height=680');
    if (!popup) { setError('Allow pop-ups to verify your phone number.'); return; }
    popupRef.current = popup;
    setPhoneBusy(true);
    const result = await startReraPhoneVerification({ challengeId: id, formType, phone, email }).catch(() => null);
    if (!result) {
      setPhoneBusy(false); popup.close(); popupRef.current = null; setError('Unable to start phone verification. Please try again.'); return;
    }
    if (!result.success) {
      setPhoneBusy(false); popup.close(); popupRef.current = null; setError(result.error); return;
    }
    if (result.alreadyVerified) {
      setPhoneBusy(false); popup.close(); popupRef.current = null; setPhoneVerified(true); return;
    }
    if (!result.url || !result.attemptId) {
      setPhoneBusy(false); popup.close(); popupRef.current = null; setError('Phone verification could not be started. Please try again.'); return;
    }
    attemptRef.current = result.attemptId;
    popup.location.href = result.url;
  };

  const sendCode = async () => {
    setError(''); setEmailBusy(true);
    const id = challengeId || crypto.randomUUID();
    if (!challengeId) { setChallengeId(id); onChallengeIdChange(id); }
    const result = await sendReraEmailOtp({ challengeId: id, formType, phone, email }).catch(() => null);
    setEmailBusy(false);
    if (!result) { setError('Unable to send the email code. Please try again.'); return; }
    if (!result.success) { setError(result.error); return; }
    if (result.verified) { setEmailVerified(true); return; }
    setOtpSent(true); setCooldown(60);
  };

  const verifyCode = async () => {
    setError(''); setEmailBusy(true);
    const result = await confirmReraEmailOtp({ challengeId, email, code: otp }).catch(() => null);
    setEmailBusy(false);
    if (!result) { setError('Unable to verify the code. Please try again.'); return; }
    if (!result.success) { setError(result.error); return; }
    setEmailVerified(true); setOtp('');
  };

  return <div className={`space-y-4 ${className}`}>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block break-words text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">Mobile Phone Number *</label>
        <div className="flex h-11 w-full border border-[#E8E2DA] bg-[#F8F5F1] focus-within:border-[#C8A96A]">
          <span className="inline-flex shrink-0 items-center border-r border-[#E8E2DA] px-3.5 text-xs text-[#1C1C1C]" aria-hidden="true">+91</span>
          <input type="tel" required inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{10}" maxLength={10} value={phoneDigits} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="98765 43210" aria-label="Mobile phone number without country code" className="min-w-0 flex-1 bg-transparent px-3.5 text-base text-[#1C1C1C] focus:outline-none" />
        </div>
        <button type="button" onClick={verifyPhone} disabled={phoneBusy || phoneVerified || phoneDigits.length !== 10 || !email} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#142A50] px-3 text-[11px] font-semibold uppercase tracking-wide text-[#142A50] disabled:opacity-50">
          {phoneBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : phoneVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {phoneBusy ? 'Verifying…' : phoneVerified ? 'Phone verified' : 'Verify phone'}
        </button>
      </div>
      <div>
        <label className="block break-words text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">Email Address *</label>
        <input type="email" required value={email} onChange={(e) => handleEmailChange(e.target.value)} placeholder="name@domain.com" className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-base text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]" />
        <div className="mt-2 flex flex-wrap gap-2">
          {otpSent && !emailVerified && <input aria-label="Six digit email verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" className="min-w-0 flex-1 h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-base" />}
          {otpSent && !emailVerified ? <>
            <button type="button" onClick={verifyCode} disabled={emailBusy || otp.length !== 6} className="min-h-11 px-3 bg-[#142A50] text-white text-[11px] font-semibold disabled:opacity-50">{emailBusy ? 'Checking…' : 'Verify code'}</button>
            <button type="button" onClick={sendCode} disabled={emailBusy || cooldown > 0 || phoneDigits.length !== 10 || !email} className="text-[10px] text-[#142A50] underline disabled:opacity-50">{cooldown ? `Resend in ${cooldown}s` : 'Resend'}</button>
          </> : <button type="button" onClick={sendCode} disabled={emailBusy || emailVerified || cooldown > 0 || phoneDigits.length !== 10 || !email} className="min-h-11 w-full border border-[#142A50] px-3 text-[#142A50] text-[11px] font-semibold uppercase tracking-wide disabled:opacity-50">{emailBusy ? 'Sending…' : emailVerified ? 'Email verified' : 'Send email OTP'}</button>}
        </div>
      </div>
    </div>
    {(phoneVerified || emailVerified) && <p className="flex items-center gap-1 text-[11px] text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{phoneVerified && emailVerified ? 'Phone and email verified.' : `${phoneVerified ? 'Phone' : 'Email'} verified.`}</p>}
    {error && <div role="alert" className="flex flex-wrap items-center gap-x-2 text-[11px] text-red-600"><span>{error}</span>{/incorrect codes|expired|new code/i.test(error) && <button type="button" onClick={reset} className="underline">Start verification over</button>}</div>}
  </div>;
}
