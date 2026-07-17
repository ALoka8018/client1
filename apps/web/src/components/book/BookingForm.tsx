"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const PROPERTY_TYPES = ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "INFRASTRUCTURE"] as const;
const PROPERTY_TYPE_LABELS: Record<(typeof PROPERTY_TYPES)[number], string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  INDUSTRIAL: "Industrial",
  INFRASTRUCTURE: "Infrastructure",
};
const CITIES = ["Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Other"];

const fieldClasses =
  "w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20 appearance-none";

export function BookingForm() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [propertyType, setPropertyType] = useState<(typeof PROPERTY_TYPES)[number]>(
    PROPERTY_TYPES[0],
  );
  const [city, setCity] = useState(CITIES[0]);
  const [date, setDate] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.files?.[0]?.name ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Your session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          propertyType,
          city,
          phone: phone || undefined,
          scheduledAt: new Date(date).toISOString(),
          problemDescription,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-white/40 bg-surface-container-lowest p-8 shadow-xl shadow-primary/5 md:p-12">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
          <span className="material-symbols-outlined">event_available</span>
        </div>
        <div>
          <h2 className="font-display text-headline-md text-primary">
            Schedule a Service
          </h2>
          <p className="font-sans text-body-md text-on-surface-variant">
            Fill in the details for a precision quote.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary/5 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-secondary">
            check_circle
          </span>
          <h3 className="font-display text-headline-md text-primary">
            Appointment Requested
          </h3>
          <p className="max-w-sm font-sans text-body-md text-on-surface-variant">
            Our team will confirm your visit shortly by phone or email. Check your
            inbox for a confirmation.
          </p>
        </div>
      ) : (
        <form className="space-y-8" onSubmit={handleSubmit}>
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
                Property Type
              </label>
              <select
                className={fieldClasses}
                value={propertyType}
                onChange={(e) =>
                  setPropertyType(e.target.value as (typeof PROPERTY_TYPES)[number])
                }
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PROPERTY_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="px-1 font-sans text-label-md text-on-surface-variant">
                Service Location (City)
              </label>
              <select className={fieldClasses} value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES.map((cityOption) => (
                  <option key={cityOption}>{cityOption}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="px-1 font-sans text-label-md text-on-surface-variant">
                Preferred Visit Date
              </label>
              <input
                required
                type="date"
                className={fieldClasses}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="px-1 font-sans text-label-md text-on-surface-variant">
              Problem Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Briefly describe the engineering issue you're facing..."
              className={`${fieldClasses} resize-none`}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="px-1 font-sans text-label-md text-on-surface-variant">
              Upload Site Images (Optional)
            </label>
            <label
              htmlFor="site-images"
              className="group flex h-48 cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-outline bg-surface-container-low text-center transition-all hover:scale-[1.01] hover:bg-surface-container"
            >
              <span className="material-symbols-outlined mb-3 text-4xl text-outline transition-colors group-hover:text-primary">
                cloud_upload
              </span>
              <p className="font-sans text-label-md text-on-surface-variant">
                {fileName ?? "Drop files here or click to browse"}
              </p>
              <p className="mt-1 text-xs text-outline">PNG, JPG up to 10MB</p>
              <input
                id="site-images"
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {error && (
            <p className="font-sans text-body-sm text-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-secondary py-5 font-display text-headline-md text-on-secondary shadow-lg shadow-secondary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Confirm Appointment"}
          </button>
        </form>
      )}
    </div>
  );
}
