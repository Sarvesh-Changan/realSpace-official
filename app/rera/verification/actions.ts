'use server';

import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendReraVerificationOtp } from '@/lib/email';

const CHALLENGE_TTL_MS = 30 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_MS = 60 * 1000;

type FormType = 'contact' | 'consultation';
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizePhone = (value: string) => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 10 ? `91${digits}` : digits;
};
const secret = () => {
  const value = process.env.OTP_SECRET;
  if (!value || value.length < 32) throw new Error('OTP_SECRET must contain at least 32 characters');
  return value;
};
const digest = (value: string) => createHmac('sha256', secret()).update(value).digest('hex');
const otpDigest = (id: string, email: string, code: string) => digest(`rera-email:${id}:${email}:${code}`);
const sameHash = (a: string, b: string) => {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
};

async function requestIp() {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}

async function enforceLimit(channel: string, destination: string, max: number, windowMs: number) {
  const now = new Date();
  if (randomInt(0, 100) === 0) {
    await Promise.all([
      prisma.reraVerificationChallenge.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.reraVerificationRateLimit.deleteMany({ where: { windowStartedAt: { lt: new Date(now.getTime() - 24 * 60 * 60_000) } } }),
    ]);
  }
  const keyHash = digest(`${channel}:${destination}`);
  return prisma.$transaction(async (tx) => {
    const current = await tx.reraVerificationRateLimit.findUnique({
      where: { keyHash_channel: { keyHash, channel } },
    });
    if (current && now.getTime() - current.windowStartedAt.getTime() < windowMs && current.count >= max) return false;
    await tx.reraVerificationRateLimit.upsert({
      where: { keyHash_channel: { keyHash, channel } },
      create: { keyHash, channel, count: 1, windowStartedAt: now },
      update: !current || now.getTime() - current.windowStartedAt.getTime() >= windowMs
        ? { count: 1, windowStartedAt: now }
        : { count: { increment: 1 } },
    });
    return true;
  });
}

async function getOrCreateChallenge(id: string, formType: FormType, phone: string, email: string) {
  const now = new Date();
  const existing = await prisma.reraVerificationChallenge.findUnique({ where: { id } });
  if (existing && (existing.consumedAt || existing.expiresAt <= now || existing.formType !== formType)) return null;
  if (existing && (existing.phone !== phone || existing.email !== email)) return null;
  if (!existing) {
    await prisma.reraVerificationChallenge.create({
      data: { id, formType, phone, email, expiresAt: new Date(now.getTime() + CHALLENGE_TTL_MS) },
    });
  }
  return prisma.reraVerificationChallenge.findUnique({ where: { id } });
}

function validId(id: unknown): id is string { return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id); }
function validFormType(value: unknown): value is FormType { return value === 'contact' || value === 'consultation'; }

export async function startReraPhoneVerification(input: {
  challengeId: string; formType: FormType; phone: string; email: string;
}) {
  try {
    const phone = normalizePhone(input.phone);
    const email = normalizeEmail(input.email);
    if (!validId(input.challengeId) || !validFormType(input.formType) || phone.length < 8 || phone.length > 15 || !email.includes('@')) {
      return { success: false as const, error: 'Enter a valid phone number and email address first.' };
    }
    const challenge = await getOrCreateChallenge(input.challengeId, input.formType, phone, email);
    if (!challenge) return { success: false as const, error: 'This verification session expired. Refresh the page and try again.' };
    if (challenge.phoneVerifiedAt && challenge.phone === phone) return { success: true as const, alreadyVerified: true };
    const ip = await requestIp();
    if (!(await enforceLimit('phone-ip', ip, 10, 15 * 60_000)) || !(await enforceLimit('phone-destination', phone, 5, 60 * 60_000))) {
      return { success: false as const, error: 'Too many phone verification requests. Please try again later.' };
    }
    const attemptId = crypto.randomUUID();
    await prisma.reraVerificationChallenge.update({
      where: { id: challenge.id },
      data: { phone, email, phoneAttemptId: attemptId, phoneVerifiedAt: null },
    });
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
    const protocol = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const base = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
    // Phone.Email appends `?access_token=...` to redirect_url. Keep our state
    // in the path so its query parameter remains parseable by the callback.
    const callback = new URL(
      `/api/rera/verification/phone/callback/${encodeURIComponent(challenge.id)}/${encodeURIComponent(attemptId)}`,
      base,
    );
    const auth = new URL('https://www.phone.email/auth/log-in');
    auth.searchParams.set('client_id', process.env.PHONE_EMAIL_CLIENT_ID || '');
    auth.searchParams.set('redirect_url', callback.toString());
    if (!process.env.PHONE_EMAIL_CLIENT_ID) return { success: false as const, error: 'Phone verification is not configured yet.' };
    return { success: true as const, url: auth.toString(), attemptId };
  } catch {
    return { success: false as const, error: 'Unable to start phone verification. Please try again.' };
  }
}

export async function sendReraEmailOtp(input: {
  challengeId: string; formType: FormType; phone: string; email: string;
}) {
  try {
    const phone = normalizePhone(input.phone);
    const email = normalizeEmail(input.email);
    if (!validId(input.challengeId) || !validFormType(input.formType) || phone.length < 8 || phone.length > 15 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false as const, error: 'Enter a valid phone number and email address first.' };
    }
    const challenge = await getOrCreateChallenge(input.challengeId, input.formType, phone, email);
    if (!challenge) return { success: false as const, error: 'This verification session expired. Refresh the page and try again.' };
    if (challenge.emailVerifiedAt && challenge.email === email) return { success: true as const, verified: true };
    if (challenge.emailAttempts >= 5) return { success: false as const, error: 'Too many incorrect codes. Start verification over to request a new code.' };
    const now = new Date();
    if (challenge.emailLastSentAt && now.getTime() - challenge.emailLastSentAt.getTime() < RESEND_MS) {
      return { success: false as const, error: 'Please wait 60 seconds before requesting another code.' };
    }
    const ip = await requestIp();
    if (!(await enforceLimit('email-ip', ip, 10, 15 * 60_000)) || !(await enforceLimit('email-destination', email, 5, 60 * 60_000))) {
      return { success: false as const, error: 'Too many email verification requests. Please try again later.' };
    }
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await prisma.reraVerificationChallenge.update({
      where: { id: challenge.id },
      data: {
        phone, email, emailOtpHash: otpDigest(challenge.id, email, code),
        emailOtpExpiresAt: new Date(now.getTime() + OTP_TTL_MS),
        emailLastSentAt: now, emailVerifiedAt: null,
      },
    });
    const result = await sendReraVerificationOtp(email, code);
    if (!result.success) {
      await prisma.reraVerificationChallenge.update({ where: { id: challenge.id }, data: { emailOtpHash: null, emailOtpExpiresAt: null } });
      return { success: false as const, error: 'We could not send the email code. Check the address or try again later.' };
    }
    return { success: true as const, cooldownSeconds: 60 };
  } catch (error) {
    console.error('[RERA email OTP] Failed to send code:', error);
    if (error instanceof Error && error.message === 'REALSPACE RERA SMTP is not configured') {
      return { success: false as const, error: 'Email verification is not configured. Add SMTP credentials to the server environment and restart the app.' };
    }
    return { success: false as const, error: 'Unable to send the email code. Please try again.' };
  }
}

export async function confirmReraEmailOtp(input: { challengeId: string; email: string; code: string }) {
  try {
    const id = input.challengeId;
    const email = normalizeEmail(input.email);
    if (!validId(id) || !/^\d{6}$/.test(input.code)) return { success: false as const, error: 'Enter the six-digit code.' };
    const challenge = await prisma.reraVerificationChallenge.findUnique({ where: { id } });
    const now = new Date();
    if (!challenge || challenge.consumedAt || challenge.expiresAt <= now || challenge.email !== email || !challenge.emailOtpHash || !challenge.emailOtpExpiresAt) {
      return { success: false as const, error: 'Request a new code to continue.' };
    }
    if (challenge.emailOtpExpiresAt <= now) return { success: false as const, error: 'That code expired. Request a new one.' };
    if (challenge.emailAttempts >= 5) return { success: false as const, error: 'Too many incorrect codes. Start verification over to request a new code.' };
    const valid = sameHash(challenge.emailOtpHash, otpDigest(id, email, input.code));
    if (!valid) {
      await prisma.reraVerificationChallenge.update({ where: { id }, data: { emailAttempts: { increment: 1 } } });
      return { success: false as const, error: 'That code is incorrect. Please try again.' };
    }
    await prisma.reraVerificationChallenge.update({
      where: { id }, data: { emailVerifiedAt: now, emailOtpHash: null, emailOtpExpiresAt: null },
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: 'Unable to verify the email code. Please try again.' };
  }
}
