"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "@repo/ui/Badge";
import { Card } from "@repo/ui/Card";
import { Button } from "@repo/ui/Button";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; label: string };

type Service = {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  priceLabel: string;
  priceAmount: string;
  active: boolean;
};

const emptyForm = {
  id: "",
  categoryId: "",
  title: "",
  description: "",
  priceLabel: "",
  priceAmount: "",
  active: true,
};

const fieldClasses =
  "w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20";
const labelClasses = "px-1 font-sans text-label-md text-on-surface-variant";

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
      <span className="material-icon mb-6 text-6xl text-outline">lock</span>
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

export default function AdminServicesPage() {
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async (headers: { Authorization: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/services`, { headers });
    if (res.ok) setServices(await res.json());
  };

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
          const servicesRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/services`,
            { headers },
          );
          if (servicesRes.ok) {
            const data = (await servicesRes.json()) as Service[];
            setServices(data);
            const seen = new Map<string, Category>();
            for (const s of data as (Service & { category?: Category })[]) {
              if (s.category) seen.set(s.category.id, s.category);
            }
            setCategories(Array.from(seen.values()));
          }
        }
      }
      setRoleChecked(true);
    })();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const handleEdit = (service: Service) => {
    setForm({
      id: service.id,
      categoryId: service.categoryId,
      title: service.title,
      description: service.description,
      priceLabel: service.priceLabel,
      priceAmount: String(service.priceAmount),
      active: service.active,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const headers = await getAuthHeader();
      if (!headers) {
        setError("Your session expired. Please sign in again.");
        return;
      }

      const payload = {
        categoryId: form.categoryId,
        title: form.title,
        description: form.description,
        priceLabel: form.priceLabel,
        priceAmount: Number(form.priceAmount),
        active: form.active,
      };

      const url = form.id
        ? `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/services/${form.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/services`;

      const res = await fetch(url, {
        method: form.id ? "PATCH" : "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Could not save service.");
        return;
      }

      resetForm();
      await loadServices(headers);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const headers = await getAuthHeader();
    if (!headers) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/services/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not delete service.");
      return;
    }

    await loadServices(headers);
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
        <span className="material-icon text-base">arrow_back</span>
        Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
          Manage Services
        </h1>
        <p className="mt-1 font-sans text-body-sm text-on-surface-variant">
          Create, edit, and toggle visibility of the services customers can book.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="h-fit p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-icon text-primary">
              {form.id ? "edit" : "add_circle"}
            </span>
            <h2 className="font-display text-headline-sm text-primary">
              {form.id ? "Edit Service" : "New Service"}
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className={labelClasses}>Category</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className={fieldClasses}
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Title</label>
              <input
                required
                placeholder="e.g. Terrace Leakage Detection & Repair"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClasses}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Description</label>
              <textarea
                required
                placeholder="What this service covers…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={fieldClasses}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className={labelClasses}>Price label</label>
                <input
                  required
                  placeholder="Starting at"
                  value={form.priceLabel}
                  onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
                  className={fieldClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Price amount (₹)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="4500"
                  value={form.priceAmount}
                  onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
                  className={fieldClasses}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 font-sans text-body-sm text-on-surface-variant">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active (visible to customers)
            </label>

            {error && (
              <p className="font-sans text-body-sm text-error" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" variant="accent" disabled={saving} fullWidth>
                {saving ? "Saving…" : form.id ? "Update Service" : "Create Service"}
              </Button>
              {form.id && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-headline-sm text-primary">Existing Services</h2>
            <span className="font-sans text-label-md text-on-surface-variant">
              {services.length} total
            </span>
          </div>
          {services.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface-container-low py-16 text-center">
              <span className="material-icon text-4xl text-outline">
                home_repair_service
              </span>
              <p className="font-sans text-body-sm text-on-surface-variant">No services yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {services.map((s) => (
                <Card key={s.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-sans text-sm font-bold text-on-surface">
                        {s.title}
                      </p>
                      <Badge variant={s.active ? "primary" : "neutral"}>
                        {s.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {s.priceLabel} — ₹{s.priceAmount}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(s)}
                      aria-label={`Edit ${s.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-surface-container-low"
                    >
                      <span className="material-icon text-lg">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      aria-label={`Delete ${s.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-error hover:bg-error-container/30"
                    >
                      <span className="material-icon text-lg">delete</span>
                    </button>
                  </div>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
