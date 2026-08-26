"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  requestPasswordReset,
  resetAdminPassword,
  verifyPasswordResetCode,
} from "./actions";
import {
  resetPasswordSchema,
  resetRequestSchema,
  resetVerifySchema,
  newPasswordFormSchema,
  type NewPasswordFormInput,
  type ResetPasswordInput,
  type ResetRequestInput,
  type ResetVerifyInput,
} from "./schema";

type Step = "email" | "code" | "password" | "done";

type ResetPasswordFlowProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function ResetPasswordFlow({ onCancel, onSuccess }: ResetPasswordFlowProps = {}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const emailForm = useForm<ResetRequestInput>({ resolver: zodResolver(resetRequestSchema) });
  const codeForm = useForm<ResetVerifyInput>({ resolver: zodResolver(resetVerifySchema) });
  const passwordForm = useForm<NewPasswordFormInput>({ resolver: zodResolver(newPasswordFormSchema) });

  const showError = (error?: string) => {
    setMessage(null);
    setServerError(error || "Something went wrong. Please try again.");
  };

  const onRequestCode = emailForm.handleSubmit(async (data) => {
    setServerError(null);
    const result = await requestPasswordReset(data);
    if (!result.success) return showError(result.error);
    setEmail(data.email.toLowerCase());
    codeForm.setValue("email", data.email.toLowerCase());
    setMessage(result.message || "Check your email for a verification code.");
    setStep("code");
  });

  const onVerifyCode = codeForm.handleSubmit(async (data) => {
    setServerError(null);
    const result = await verifyPasswordResetCode(data);
    if (!result.success || !result.verifiedToken) return showError(result.error);
    setVerifiedToken(result.verifiedToken);
    setStep("password");
  });

  const onResetPassword = async () => {
    setServerError(null);
    const data = passwordForm.getValues();
    const validation = newPasswordFormSchema.safeParse(data);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return showError(issue?.message || "Please enter a valid new password.");
    }

    setIsResetting(true);
    try {
      const result = await resetAdminPassword({
        ...validation.data,
        email,
        verifiedToken,
      });

      if (!result.success) return showError(result.error);
      if (onSuccess) {
        onSuccess();
      } else {
        setStep("done");
      }
    } catch (error) {
      console.error("Password reset request failed:", error);
      showError("Unable to reset password. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-neutral-950 px-6 py-12 text-neutral-100 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-white">Reset admin password</h1>
        <p className="mt-2 text-center text-sm text-neutral-400">Securely recover access to the REALSPACE dashboard.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-neutral-800 bg-neutral-900 px-6 py-8 shadow-xl sm:rounded-lg sm:px-10">
          {message && <div className="mb-6 rounded-md border border-green-800 bg-green-950/80 p-4 text-sm text-green-200">{message}</div>}
          {serverError && <div className="mb-6 rounded-md border border-red-800 bg-red-950/80 p-4 text-sm text-red-200">{serverError}</div>}

          {step === "email" && (
            <form className="space-y-6" onSubmit={onRequestCode}>
              <FieldError message={emailForm.formState.errors.email?.message} />
              <label className="block text-sm font-medium text-neutral-200" htmlFor="reset-email">Admin email address</label>
              <input id="reset-email" type="email" autoComplete="email" {...emailForm.register("email")} className={inputClass} placeholder="admin@realspace.in" />
              <SubmitButton label="Send verification code" loading={emailForm.formState.isSubmitting} />
            </form>
          )}

          {step === "code" && (
            <form className="space-y-6" onSubmit={onVerifyCode}>
              <label className="block text-sm font-medium text-neutral-200" htmlFor="reset-code">6-digit verification code</label>
              <input id="reset-code" inputMode="numeric" autoComplete="one-time-code" {...codeForm.register("code")} className={inputClass} placeholder="123456" />
              <FieldError message={codeForm.formState.errors.code?.message} />
              <SubmitButton label="Verify code" loading={codeForm.formState.isSubmitting} />
            </form>
          )}

          {step === "password" && (
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                void onResetPassword();
              }}
            >
              <div><label className="block text-sm font-medium text-neutral-200" htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" {...passwordForm.register("password")} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-neutral-200" htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" autoComplete="new-password" {...passwordForm.register("confirmPassword")} className={inputClass} /></div>
              <FieldError message={passwordForm.formState.errors.password?.message || passwordForm.formState.errors.confirmPassword?.message} />
              <SubmitButton label="Reset password" loading={isResetting} />
            </form>
          )}

          {step === "done" && <div className="text-center"><p className="text-sm text-green-200">Your password has been reset successfully.</p><Link href="/admin/login" className="mt-6 inline-block text-sm font-semibold text-red-400 hover:text-red-300">Return to sign in</Link></div>}
          {step !== "done" && (onCancel ? <button type="button" onClick={onCancel} className="mt-6 block w-full text-center text-sm text-neutral-400 hover:text-white">Back to sign in</button> : <Link href="/admin/login" className="mt-6 block text-center text-sm text-neutral-400 hover:text-white">Back to sign in</Link>)}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordFlow />;
}

const inputClass = "mt-2 block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-red-400">{message}</p> : null;
}

function SubmitButton({ label, loading }: { label: string; loading: boolean }) {
  return <button type="submit" disabled={loading} className="flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500 disabled:opacity-50">{loading ? "Please wait..." : label}</button>;
}
