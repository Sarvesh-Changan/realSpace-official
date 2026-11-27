import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 10 ? `91${digits}` : digits;
}

function normalizeProviderPhone(countryCode: string | number | undefined, phoneNo: string | number | undefined) {
  const country = String(countryCode || '').replace(/\D/g, '');
  let nationalNumber = String(phoneNo || '').replace(/\D/g, '');
  if (nationalNumber.startsWith('00')) nationalNumber = nationalNumber.slice(2);
  if (country === '91' && nationalNumber.length === 11 && nationalNumber.startsWith('0')) {
    nationalNumber = nationalNumber.slice(1);
  }

  const internationalNumber = country && !nationalNumber.startsWith(country)
    ? `${country}${nationalNumber}`
    : nationalNumber;
  return normalizePhone(internationalNumber);
}

function callbackPage(success: boolean, challengeId: string, attemptId: string, emailVerified = false, requestedReturnTo = '/rera/contact', returnForm = 'contact') {
  const safeId = /^[0-9a-f-]{36}$/i.test(challengeId) ? challengeId : '';
  const safeAttempt = /^[0-9a-f-]{36}$/i.test(attemptId) ? attemptId : '';
  const message = JSON.stringify({ type: 'rera-phone-verification', success, emailVerified: success && emailVerified, challengeId: safeId, attemptId: safeAttempt });
  let returnPath = '/rera/contact';
  try {
    const candidate = new URL(requestedReturnTo, 'https://realspace.invalid');
    if (candidate.origin === 'https://realspace.invalid' && (candidate.pathname === '/rera' || candidate.pathname.startsWith('/rera/'))) {
      returnPath = candidate.pathname;
    }
  } catch {
    // Keep the contact page as the safe fallback for malformed paths.
  }
  const callbackUrl = `${returnPath}?phoneVerification=${success ? 'complete' : 'failed'}&emailVerification=${success && emailVerified ? 'complete' : 'pending'}&challengeId=${encodeURIComponent(safeId)}&attemptId=${encodeURIComponent(safeAttempt)}`;
  const destination = new URL(callbackUrl, 'https://realspace.invalid');
  if (returnForm === 'consultation') destination.searchParams.set('openConsultation', '1');
  const returnUrl = `${destination.pathname}${destination.search}`;
  const html = `<!doctype html><html><head><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><title>REALSPACE verification</title></head><body style="font:16px Arial,sans-serif;padding:24px;color:#142a50"><p>${success ? 'Phone number verified. Returning to your enquiry form…' : 'Phone verification could not be completed. Returning to your enquiry form…'}</p><script>const result=${message};const returnUrl=${JSON.stringify(returnUrl)};try{localStorage.setItem('rera-phone-verification:'+result.challengeId,JSON.stringify(result))}catch{}let notified=false;try{if(window.opener&&!window.opener.closed){window.opener.postMessage(result,window.location.origin);notified=true}}catch{}if(notified){window.close();setTimeout(()=>{if(!window.closed)window.location.replace(returnUrl)},300)}else{window.location.replace(returnUrl)}</script></body></html>`;
  return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' } });
}

export async function handlePhoneVerificationCallback(
  request: NextRequest,
  challengeId: string,
  attemptId: string,
  returnTo = '/rera/contact',
  returnForm: 'contact' | 'consultation' = 'contact',
) {
  const accessToken = request.nextUrl.searchParams.get('access_token') || '';
  if (!accessToken || !/^[0-9a-f-]{36}$/i.test(challengeId) || !/^[0-9a-f-]{36}$/i.test(attemptId)) {
    return callbackPage(false, challengeId, attemptId, false, returnTo, returnForm);
  }

  try {
    const clientId = process.env.PHONE_EMAIL_CLIENT_ID;
    if (!clientId) return callbackPage(false, challengeId, attemptId, false, returnTo, returnForm);
    const form = new FormData();
    form.set('access_token', accessToken);
    form.set('client_id', clientId);
    const verification = await fetch('https://eapi.phone.email/getuser', {
      method: 'POST', body: form, cache: 'no-store', signal: AbortSignal.timeout(10_000),
    });
    if (!verification.ok) {
      console.warn('[RERA phone callback] Provider verification request failed:', verification.status);
      return callbackPage(false, challengeId, attemptId, false, returnTo, returnForm);
    }
    const body = await verification.json() as {
      status?: string | number; country_code?: string | number; phone_no?: string | number;
      data?: { country_code?: string | number; phone_no?: string | number };
    };
    const data = body.data || body;
    const apiStatus = String(body.status || '').toLowerCase();
    if (apiStatus && !['200', 'success', 'ok'].includes(apiStatus)) {
      console.warn('[RERA phone callback] Provider returned a rejected verification status:', apiStatus);
      return callbackPage(false, challengeId, attemptId, false, returnTo, returnForm);
    }
    const verifiedPhone = normalizeProviderPhone(data.country_code, data.phone_no);
    const challenge = await prisma.reraVerificationChallenge.findUnique({ where: { id: challengeId } });
    const challengeIsValid = Boolean(challenge && !challenge.consumedAt && challenge.expiresAt > new Date());
    const attemptIsCurrent = challenge?.phoneAttemptId === attemptId;
    const phoneMatches = Boolean(challenge && verifiedPhone && normalizePhone(challenge.phone) === verifiedPhone);
    if (!challengeIsValid || !attemptIsCurrent || !phoneMatches) {
      console.warn('[RERA phone callback] Verification data did not match:', {
        challengeIsValid,
        attemptIsCurrent,
        phoneMatches,
      });
      return callbackPage(false, challengeId, attemptId, false, returnTo, returnForm);
    }

    await prisma.reraVerificationChallenge.update({
      where: { id: challengeId }, data: { phoneVerifiedAt: new Date() },
    });
    return callbackPage(true, challengeId, attemptId, Boolean(challenge?.emailVerifiedAt), returnTo, returnForm);
  } catch (error) {
    console.error('[RERA phone callback] Verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return callbackPage(false, challengeId, attemptId, false, returnTo, returnForm);
  }
}
