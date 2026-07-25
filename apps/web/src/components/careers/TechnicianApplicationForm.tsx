"use client";

import { useState, type FormEvent } from "react";

const fieldClasses =
  "w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20";

export function TechnicianApplicationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [experience, setExperience] = useState("");
  const [certifications, setCertifications] = useState("");
  const [availability, setAvailability] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/technician-applications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            city,
            experience,
            certifications: certifications || undefined,
            availability,
          }),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary/5 py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-secondary">
          check_circle
        </span>
        <h3 className="font-display text-headline-md text-primary-container">
          Application Received
        </h3>
        <p className="max-w-sm font-sans text-body-md text-on-surface-variant">
          Thanks for applying. Our team reviews every application manually and will reach out if
          it&apos;s a fit.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="px-1 font-sans text-label-md text-on-surface-variant">
            Full Name
          </label>
          <input
            required
            className={fieldClasses}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="px-1 font-sans text-label-md text-on-surface-variant">
            Email
          </label>
          <input
            required
            type="email"
            className={fieldClasses}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="px-1 font-sans text-label-md text-on-surface-variant">
            Phone Number
          </label>
          <input
            required
            type="tel"
            placeholder="+91 98765 43210"
            className={fieldClasses}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="px-1 font-sans text-label-md text-on-surface-variant">
            City
          </label>
          <input
            required
            placeholder="e.g. Bhubaneswar"
            className={fieldClasses}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="px-1 font-sans text-label-md text-on-surface-variant">
          Experience
        </label>
        <textarea
          required
          rows={3}
          placeholder="How many years, what kind of plumbing/waterproofing work…"
          className={fieldClasses}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="px-1 font-sans text-label-md text-on-surface-variant">
          Certifications (optional)
        </label>
        <input
          placeholder="e.g. ITI Plumbing Certificate"
          className={fieldClasses}
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="px-1 font-sans text-label-md text-on-surface-variant">
          Availability
        </label>
        <input
          required
          placeholder="e.g. Weekdays, full-time"
          className={fieldClasses}
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </div>

      {error && (
        <p className="font-sans text-body-sm text-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-secondary py-5 font-display text-headline-md text-on-secondary shadow-lg shadow-secondary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
