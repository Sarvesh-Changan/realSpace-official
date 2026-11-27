import { NextRequest } from 'next/server';
import { handlePhoneVerificationCallback } from './handler';

// Keep the query-based route for any provider callbacks already in flight.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  return handlePhoneVerificationCallback(
    request,
    searchParams.get('challenge_id') || '',
    searchParams.get('attempt_id') || '',
  );
}
