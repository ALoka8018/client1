"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Invoice = {
  id: string;
  number: string;
  bookingCode: string;
  amount: string;
  issuedAt: string;
  paidAt: string | null;
};

type Attachment = {
  id: string;
  bookingCode: string;
  fileName: string;
  mimeType: string;
  url: string;
  createdAt: string;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function DocumentsList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) {
            setError("Your session expired. Please sign in again.");
            setLoading(false);
          }
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/documents`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          if (!cancelled) setError("Could not load your documents. Please try again.");
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
          setAttachments(Array.isArray(data.attachments) ? data.attachments : []);
        }
      } catch {
        if (!cancelled) setError("Could not reach the server. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const downloadInvoice = async (invoice: Invoice) => {
    setDownloadError(null);
    setDownloadingId(invoice.id);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setDownloadError("Your session expired. Please sign in again.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/invoices/${invoice.number}/pdf`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setDownloadError(body?.error ?? "Could not prepare the download. Please try again.");
        return;
      }

      const { url } = (await res.json()) as { url: string };
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setDownloadError("Could not reach the server. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
        Loading your documents…
      </p>
    );
  }

  if (error) {
    return (
      <p className="px-6 py-10 text-center font-sans text-body-md text-error">{error}</p>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 font-display text-headline-sm text-primary-container">Invoices</h3>
        {downloadError && (
          <p className="mb-4 font-sans text-body-sm text-error" role="alert">
            {downloadError}
          </p>
        )}
        <div className="overflow-x-auto rounded-3xl border border-white/50 bg-surface-container-lowest shadow-level-1">
          {invoices.length === 0 ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              No paid invoices yet — invoices appear here once payment is confirmed.
            </p>
          ) : (
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 font-sans text-label-md text-primary">Invoice</th>
                  <th className="px-6 py-4 font-sans text-label-md text-primary">Booking</th>
                  <th className="px-6 py-4 font-sans text-label-md text-primary">Paid On</th>
                  <th className="px-6 py-4 font-sans text-label-md text-primary">Amount</th>
                  <th className="px-6 py-4 text-right font-sans text-label-md text-primary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {invoice.bookingCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {invoice.paidAt ? formatDate(invoice.paidAt) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {currencyFormatter.format(Number(invoice.amount))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={downloadingId === invoice.id}
                        onClick={() => downloadInvoice(invoice)}
                        className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
                      >
                        <span className="material-icon text-sm">download</span>
                        {downloadingId === invoice.id ? "Preparing…" : "Download PDF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 font-display text-headline-sm text-primary-container">
          Inspection Reports &amp; Photos
        </h3>
        <div className="overflow-hidden rounded-3xl border border-white/50 bg-surface-container-lowest shadow-level-1">
          {attachments.length === 0 ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              No inspection reports or job photos yet — these will appear here once a technician
              uploads them.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/30">
              {attachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-icon text-primary">description</span>
                    <div>
                      <p className="font-sans text-sm font-bold text-on-surface">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {attachment.bookingCode} • {formatDate(attachment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={attachment.url}
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
      </section>
    </div>
  );
}
