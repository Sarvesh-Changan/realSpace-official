"use client";

import { useState, type FormEvent } from "react";
import { submitReraEnquiry } from "@/app/rera/actions";

export function PropertyEnquiryForm({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setState("sending");
    const form = new FormData(event.currentTarget);
    const result = await submitReraEnquiry({
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      message: String(form.get("message") || ""),
      interestedIn: "BUY",
      propertySlug: slug,
      source: "PROPERTY_ENQUIRY",
      details: { propertyTitle: title },
      honeypot: String(form.get("website") || ""),
    });

    if (!result.success) {
      setError(result.error || "Unable to send your enquiry. Please try again.");
      setState("idle");
      return;
    }

    setState("sent");
  }

  if (state === "sent") {
    return <p role="status" className="rs-enquiry-success">Thank you. Your enquiry for {title} has been sent.</p>;
  }

  return (
    <form className="rs-enquiry-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input name="name" required minLength={2} autoComplete="name" />
      </label>
      <label>
        Phone
        <input name="phone" type="tel" required autoComplete="tel" />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" />
      </label>
      <label>
        Message
        <textarea name="message" rows={3} defaultValue={`I’m interested in ${title}.`} />
      </label>
      <label className="rs-enquiry-honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {error && <p role="alert" className="rs-enquiry-error">{error}</p>}
      <button className="rs-button" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send Enquiry"}
      </button>
    </form>
  );
}
