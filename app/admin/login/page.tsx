"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "./schema";
import { loginServerAction } from "./actions";

export default function AdminLoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // 1. Run Server Action (validates inputs, checks rate limits, verifies password)
      const result = await loginServerAction(data);

      if (!result.success) {
        setServerError(result.error || "Authentication failed");
        setIsSubmitting(false);
        return;
      }

      // 2. Complete sign in via NextAuth session cookie creation
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/admin",
        redirect: false,
      });

      if (res?.error) {
        setServerError("Invalid credentials or session error");
        setIsSubmitting(false);
      } else if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-neutral-950 text-neutral-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          REALSPACE Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Sign in to access the studio dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-900 px-6 py-8 shadow-xl border border-neutral-800 sm:rounded-lg sm:px-10">
          {serverError && (
            <div className="mb-6 rounded-md bg-red-950/80 p-4 border border-red-800 text-red-200 text-sm">
              {serverError}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-200"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
                  placeholder="admin@realspace.in"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-200"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className="block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
