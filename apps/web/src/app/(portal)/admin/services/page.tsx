"use client";

import { useEffect, useState, type FormEvent } from "react";
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
      <h1 className="mb-8 font-display text-headline-lg-mobile text-primary md:text-headline-lg">
        Manage Services
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        <form className="glass h-fit space-y-4 rounded-3xl p-6" onSubmit={handleSubmit}>
          <h3 className="font-display text-headline-sm text-primary">
            {form.id ? "Edit Service" : "New Service"}
          </h3>

          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          />

          <textarea
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
          />

          <input
            required
            placeholder="Price label (e.g. Starting at)"
            value={form.priceLabel}
            onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
            className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          />

          <input
            required
            type="number"
            step="0.01"
            placeholder="Price amount"
            value={form.priceAmount}
            onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
            className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          />

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

        <div>
          <h3 className="mb-4 font-display text-headline-sm text-primary">Existing services</h3>
          {services.length === 0 ? (
            <p className="text-on-surface-variant">No services yet.</p>
          ) : (
            <ul className="space-y-3">
              {services.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4"
                >
                  <div>
                    <p className="font-sans text-sm font-bold text-on-surface">
                      {s.title} {!s.active && "(inactive)"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {s.priceLabel} — ₹{s.priceAmount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(s)}
                      className="text-sm font-bold text-primary hover:opacity-80"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="text-sm font-bold text-error hover:opacity-80"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
