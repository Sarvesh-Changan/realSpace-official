import { NextRequest } from 'next/server';
import { handlePhoneVerificationCallback } from '../../handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ challengeId: string; attemptId: string }> },
) {
  const { challengeId, attemptId } = await params;
  return handlePhoneVerificationCallback(request, challengeId, attemptId);
}
