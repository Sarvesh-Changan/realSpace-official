"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeAdminPassword } from "../actions";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "../schema";

const inputClass =
  "mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsSubmitting(true);
    setMessage(null);

    const result = await changeAdminPassword(data);
    if (result.success) {
      setMessage({
        type: "success",
        text: "Password changed successfully. Your current session remains active.",
      });
      reset();
    } else {
      setMessage({
        type: "error",
        text: result.error || "Unable to change password.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Change Password</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Verify your current password before setting a new one.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-md p-4 text-sm ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:max-w-xl">
        <PasswordField
          id="currentPassword"
          label="Current Password"
          registration={register("currentPassword")}
          error={errors.currentPassword?.message}
          autoComplete="current-password"
        />
        <PasswordField
          id="newPassword"
          label="New Password"
          registration={register("newPassword")}
          error={errors.newPassword?.message}
          autoComplete="new-password"
        />
        <PasswordField
          id="confirmNewPassword"
          label="Confirm New Password"
          registration={register("confirmNewPassword")}
          error={errors.confirmNewPassword?.message}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-500 disabled:opacity-50 sm:w-auto"
      >
        {isSubmitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

function PasswordField({
  id,
  label,
  registration,
  error,
  autoComplete,
}: {
  id: keyof ChangePasswordInput;
  label: string;
  registration: ReturnType<ReturnType<typeof useForm<ChangePasswordInput>>["register"]>;
  error?: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={id}
        type="password"
        autoComplete={autoComplete}
        {...registration}
        className={inputClass}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
