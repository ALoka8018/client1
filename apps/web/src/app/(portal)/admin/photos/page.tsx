"use client";

import { useEffect, useState, type FormEvent } from "react";
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
      <h1 className="mb-8 font-display text-headline-lg-mobile text-primary md:text-headline-lg">
        Job Photos
      </h1>

      <div className="mx-auto max-w-2xl space-y-8">
        <div className="glass rounded-3xl p-6">
          <label className="mb-2 block px-1 font-sans text-label-md text-on-surface-variant">
            Booking
          </label>
          <select
            value={selectedBookingId}
            onChange={(e) => handleSelectBooking(e.target.value)}
            className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a booking…</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.userEmail} — {b.serviceTitle ?? "No service"} ({b.status})
              </option>
            ))}
          </select>
        </div>

        {selectedBookingId && (
          <>
            <form className="glass space-y-4 rounded-3xl p-6" onSubmit={handleUpload}>
              <h3 className="font-display text-headline-sm text-primary">Upload a photo</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full font-sans text-body-sm text-on-surface-variant"
              />
              <select
                value={photoType}
                onChange={(e) => setPhotoType(e.target.value as "BEFORE" | "AFTER")}
                className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="BEFORE">Before</option>
                <option value="AFTER">After</option>
              </select>
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

            <div>
              <h3 className="mb-4 font-display text-headline-sm text-primary">
                Existing photos for this booking
              </h3>
              {attachmentsLoading ? (
                <p className="text-on-surface-variant">Loading…</p>
              ) : attachments.length === 0 ? (
                <p className="text-on-surface-variant">No photos uploaded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {attachments.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4"
                    >
                      <div>
                        <p className="font-sans text-sm font-bold text-on-surface">
                          {a.fileName} {a.photoType ? `(${a.photoType})` : ""}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {a.featured ? "Featured, consented" : "Not featured"}
                        </p>
                      </div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-primary hover:opacity-80"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
