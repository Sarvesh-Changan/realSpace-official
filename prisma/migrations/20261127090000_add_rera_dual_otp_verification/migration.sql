CREATE TABLE "ReraVerificationChallenge" (
    "id" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phoneAttemptId" TEXT,
    "phoneVerifiedAt" TIMESTAMP(3),
    "emailOtpHash" TEXT,
    "emailOtpExpiresAt" TIMESTAMP(3),
    "emailAttempts" INTEGER NOT NULL DEFAULT 0,
    "emailLastSentAt" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReraVerificationChallenge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReraVerificationChallenge_expiresAt_idx" ON "ReraVerificationChallenge"("expiresAt");
CREATE INDEX "ReraVerificationChallenge_phone_email_idx" ON "ReraVerificationChallenge"("phone", "email");

CREATE TABLE "ReraVerificationRateLimit" (
    "keyHash" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReraVerificationRateLimit_pkey" PRIMARY KEY ("keyHash", "channel")
);

CREATE INDEX "ReraVerificationRateLimit_windowStartedAt_idx" ON "ReraVerificationRateLimit"("windowStartedAt");
