import { NextRequest } from 'next/server';
import { handlePhoneVerificationCallback } from '../../handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ challengeId: string; attemptId: string }> },
) {
  const { challengeId: rawChallengeId, attemptId } = await params;
  const [challengeId, encodedContext] = rawChallengeId.split('~', 2);
  let returnTo = '/rera/contact';
  let returnForm: 'contact' | 'consultation' = 'contact';
  if (encodedContext) {
    try {
      const context = JSON.parse(Buffer.from(encodedContext, 'base64url').toString('utf8')) as {
        returnTo?: unknown;
        returnForm?: unknown;
      };
      if (typeof context.returnTo === 'string') returnTo = context.returnTo;
      if (context.returnForm === 'consultation') returnForm = 'consultation';
    } catch {
      // Invalid return context falls back to the contact form.
    }
  }
  return handlePhoneVerificationCallback(request, challengeId, attemptId, returnTo, returnForm);
}
