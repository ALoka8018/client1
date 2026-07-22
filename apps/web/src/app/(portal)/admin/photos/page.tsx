"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "@repo/ui/Badge";
import { Card } from "@repo/ui/Card";
import { Button } from "@repo/ui/Button";
import { createClient } from "@/lib/supabase/client";

type AdminBooking = {
  id: string;
  code: string;
  status: string;
  userEmail: string;
  serviceTitle: string | null;
};

type Attachment = {
  id: string;
  fileName: string;
  photoType: "BEFORE" | "AFTER" | null;
  featured: boolean;
  consentedAt: string | null;
  url: string;
};

const labelClasses = "px-1 font-sans text-label-md text-on-surface-variant";
const fieldClasses =
  "w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20";

async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : null;
}

function Restricted() {
  return (
    <div className="container-max flex flex-col items-center py-section-mobile text-center md:py-section-desktop">
      <span className="material-symbols-outlined mb-6 text-6xl text-outline">lock</span>
      <h1 className="mb-4 font-display text-headline-md text-primary">
        Admin Panel — Restricted
      </h1>
      <p className="max-w-md font-sans text-body-md text-on-surface-variant">
        This area is limited to Seepage Leakage All Solutions staff accounts with administrative
        permissions. If you believe you should have access, contact your account manager.
      </p>
    </div>
  );
}

export default function AdminPhotosPage() {
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<"BEFORE" | "AFTER">("BEFORE");
  const [consent, setConsent] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const headers = await getAuthHeader();
      if (!headers) {
        setRoleChecked(true);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/me`, { headers });
      if (res.ok) {
        const me = await res.json();
        setIsAdmin(me.role === "ADMIN");

        if (me.role === "ADMIN") {
          const bookingsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/bookings`,
            { headers },
          );
          if (bookingsRes.ok) {
            const data = (await bookingsRes.json()) as AdminBooking[];
            setBookings(Array.isArray(data) ? data : []);
          }
        }
      }
      setRoleChecked(true);
    })();
  }, []);

  const loadAttachments = async (bookingId: string) => {
    setAttachmentsLoading(true);
    const headers = await getAuthHeader();
    if (!headers) {
      setAttachmentsLoading(false);
      return;
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/bookings/${bookingId}/attachments`,
      { headers },
    );
    if (res.ok) {
      const data = (await res.json()) as Attachment[];
      setAttachments(Array.isArray(data) ? data : []);
    }
    setAttachmentsLoading(false);
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setAttachments([]);
    if (bookingId) loadAttachments(bookingId);
  };

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(null);

    if (!selectedBookingId) {
      setUploadError("Select a booking first.");
      return;
    }
    if (!file) {
      setUploadError("Choose a file to upload.");
      return;
    }
    if (featured && !consent) {
      setUploadError("Featuring a photo publicly requires customer consent.");
      return;
    }

    setUploading(true);

    try {
      const headers = await getAuthHeader();
      if (!headers) {
        setUploadError("Your session expired. Please sign in again.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("photoType", photoType);
      formData.append("featured", String(featured));
      formData.append("consent", String(consent));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/bookings/${selectedBookingId}/attachments`,
        { method: "POST", headers, body: formData },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setUploadError(body?.error ?? "Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      setFile(null);
      setConsent(false);
      setFeatured(false);
      await loadAttachments(selectedBookingId);
    } catch {
      setUploadError("Could not reach the server. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!roleChecked) {
    return (
      <div className="container-max py-section-mobile text-center md:py-section-desktop">
        <p className="text-on-surface-variant">Checking access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Restricted />;
  }

  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 font-sans text-label-md text-on-surface-variant hover:text-primary"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
          Job Photos
        </h1>
        <p className="mt-1 font-sans text-body-sm text-on-surface-variant">
          Upload before/after photos and manage what's featured in the public gallery.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-8">
        <Card className="p-6">
          <div className="space-y-2">
            <label className={labelClasses}>Booking</label>
            <select
              value={selectedBookingId}
              onChange={(e) => handleSelectBooking(e.target.value)}
              className={fieldClasses}
            >
              <option value="">Select a booking…</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} — {b.userEmail} — {b.serviceTitle ?? "No service"} ({b.status})
                </option>
              ))}
            </select>
            {selectedBooking && (
              <div className="px-1">
                <Badge variant="neutral">{selectedBooking.status}</Badge>
              </div>
            )}
          </div>
        </Card>

        {selectedBookingId && (
          <>
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_a_photo</span>
                <h2 className="font-display text-headline-sm text-primary">Upload a photo</h2>
              </div>
              <form className="space-y-4" onSubmit={handleUpload}>
                <div className="space-y-2">
                  <label className={labelClasses}>Photo file</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-2xl bg-surface-container-low px-4 py-3 font-sans text-body-sm text-on-surface-variant"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>Photo type</label>
                  <select
                    value={photoType}
                    onChange={(e) => setPhotoType(e.target.value as "BEFORE" | "AFTER")}
                    className={fieldClasses}
                  >
                    <option value="BEFORE">Before</option>
                    <option value="AFTER">After</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 font-sans text-body-sm text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  Customer has consented to this photo being used publicly
                </label>
                <label className="flex items-center gap-2 font-sans text-body-sm text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    disabled={!consent}
                  />
                  Feature in public /projects gallery
                </label>
                {uploadError && (
                  <p className="font-sans text-body-sm text-error" role="alert">
                    {uploadError}
                  </p>
                )}
                <Button type="submit" variant="accent" disabled={uploading} fullWidth>
                  {uploading ? "Uploading…" : "Upload Photo"}
                </Button>
              </form>
            </Card>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-headline-sm text-primary">
                  Existing photos for this booking
                </h2>
                <span className="font-sans text-label-md text-on-surface-variant">
                  {attachments.length} total
                </span>
              </div>
              {attachmentsLoading ? (
                <p className="text-on-surface-variant">Loading…</p>
              ) : attachments.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface-container-low py-16 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline">
                    photo_library
                  </span>
                  <p className="font-sans text-body-sm text-on-surface-variant">
                    No photos uploaded yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <Card className="overflow-hidden p-0">
                        <div className="relative aspect-square bg-surface-container-low">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={a.url}
                            alt={a.fileName}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          {a.photoType && (
                            <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-1 font-sans text-label-sm text-on-primary">
                              {a.photoType}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="truncate font-sans text-xs font-bold text-on-surface">
                            {a.fileName}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {a.featured ? "Featured, consented" : "Not featured"}
                          </p>
                        </div>
                      </Card>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
