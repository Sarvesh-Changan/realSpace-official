"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { submitContactForm } from "../actions";
import { contactFormSchema, type ContactFormValues } from "../schema";

export function ContactForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      service: "Not Sure",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setServerError(null);

    const result = await submitContactForm(data);

    if (!result.success) {
      setServerError(result.error || "Submission failed. Please try again.");
      return;
    }

    setIsSuccess(true);
    reset();
  };

  if (isSuccess) {
    return (
      <div className="bg-brand-bgAlt rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px] border border-neutral-200 shadow-sm">
        <div className="w-16 h-16 bg-brand-yellow/20 text-brand-yellow rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-brand-text mb-3">
          Message Sent Successfully!
        </h3>
        <p className="text-neutral-600 mb-8 max-w-md mx-auto">
          Thank you for reaching out to REALSPACE. Our team will review your
          requirements and get back to you shortly.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-brand-red font-medium hover:text-red-700 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg rounded-2xl p-5 sm:p-8 md:p-10 border border-neutral-200 shadow-sm">
      <h3 className="text-xl sm:text-2xl font-bold text-brand-text mb-4 sm:mb-6">
        Send us a Message
      </h3>

      {serverError && (
        <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 bg-red-50 border border-red-200 text-brand-red text-xs sm:text-sm rounded-lg">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Hidden Honeypot Field */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          {...register("honeypot")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-1.5"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              {...register("fullName")}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-lg border border-neutral-300 bg-white text-brand-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-shadow"
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs sm:text-sm text-brand-red">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-1.5"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-lg border border-neutral-300 bg-white text-brand-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-shadow"
              placeholder="+91 99999 99999"
            />
            {errors.phone && (
              <p className="mt-1 text-xs sm:text-sm text-brand-red">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-lg border border-neutral-300 bg-white text-brand-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-shadow"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs sm:text-sm text-brand-red">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Service Interested In */}
        <div>
          <label
            htmlFor="service"
            className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-1.5"
          >
            Service Interested In
          </label>
          <select
            id="service"
            {...register("service")}
            className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-lg border border-neutral-300 bg-white text-brand-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-shadow appearance-none cursor-pointer"
          >
            <option value="Interior">Interior Design</option>
            <option value="Exterior">Exterior & Elevation</option>
            <option value="Not Sure">Not Sure Yet</option>
          </select>
          {errors.service && (
            <p className="mt-1 text-xs sm:text-sm text-brand-red">
              {errors.service.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-1.5"
          >
            Your Message
          </label>
          <textarea
            id="message"
            rows={4}
            {...register("message")}
            className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 bg-white text-brand-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-shadow resize-none"
            placeholder="Tell us about your project, location, and requirements..."
          />
          {errors.message && (
            <p className="mt-1 text-xs sm:text-sm text-brand-red">
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[48px] bg-brand-red border-2 border-brand-red hover:bg-brand-yellow hover:border-brand-yellow text-brand-yellow hover:text-brand-red font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base cursor-pointer"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
