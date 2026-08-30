"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@repo/ui/Badge";
import { Card } from "@repo/ui/Card";
import { useAdminRole, Restricted } from "../layout";

type Role = "CUSTOMER" | "TECHNICIAN" | "ADMIN" | "SUPER_ADMIN";

type TechnicianApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  certifications: string | null;
  availability: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

type StaffUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  technicianActive: boolean | null;
};

const ROLES: Role[] = ["CUSTOMER", "TECHNICIAN", "ADMIN", "SUPER_ADMIN"];

const fieldClasses =
  "w-full rounded-2xl border-none bg-surface-container-low px-4 py-2.5 font-sans text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20";

export default function AdminStaffPage() {
  const { role, headers } = useAdminRole();

  if (role !== "SUPER_ADMIN") {
    return <Restricted />;
  }

  return <StaffManagement headers={headers} />;
}

function StaffManagement({ headers }: { headers: { Authorization: string } }) {
  const [applications, setApplications] = useState<TechnicianApplication[]>([]);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadApplications = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/technician-applications`, {
      headers,
    });
    if (res.ok) setApplications(await res.json());
  };

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (roleFilter) params.set("role", roleFilter);
    if (q) params.set("q", q);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/users?${params.toString()}`,
      { headers },
    );
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    (async () => {
      await loadApplications();
      await loadUsers();
    })();
  }, [headers]);

  useEffect(() => {
    (async () => {
      await loadUsers();
    })();
  }, [roleFilter, q]);

  const handleReviewApplication = async (id: string, status: "APPROVED" | "REJECTED") => {
    setError(null);
    setBusyId(id);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/technician-applications/${id}`,
      {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not update application.");
      setBusyId(null);
      return;
    }
    await loadApplications();
    await loadUsers();
    setBusyId(null);
  };

  const handleUpdateUser = async (id: string, update: Partial<Pick<StaffUser, "role" | "technicianActive">>) => {
    setError(null);
    setBusyId(id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/users/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not update user.");
      setBusyId(null);
      return;
    }
    await loadUsers();
    setBusyId(null);
  };

  const pendingApplications = applications.filter((a) => a.status === "PENDING");
  const reviewedApplications = applications.filter((a) => a.status !== "PENDING");

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
          Manage Staff & Users
        </h1>
        <p className="mt-1 font-sans text-body-sm text-on-surface-variant">
          Review technician applications and manage account roles.
        </p>
      </div>

      {error && (
        <p className="mb-4 font-sans text-body-sm text-error" role="alert">
          {error}
        </p>
      )}

      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-headline-sm text-primary">Technician Applications</h2>
          {pendingApplications.length > 0 && (
            <Badge variant="neutral" className="w-fit normal-case">
              {pendingApplications.length} pending
            </Badge>
          )}
        </div>

        {applications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface-container-low py-16 text-center">
            <span className="material-icon text-4xl text-outline">assignment_ind</span>
            <p className="font-sans text-body-sm text-on-surface-variant">
              No applications yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {[...pendingApplications, ...reviewedApplications].map((a) => (
              <Card key={a.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-sans text-sm font-bold text-on-surface">
                      {a.name}
                    </p>
                    <Badge
                      variant={
                        a.status === "APPROVED"
                          ? "primary"
                          : a.status === "REJECTED"
                            ? "error"
                            : "neutral"
                      }
                    >
                      {a.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {a.email} — {a.phone} — {a.city}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {a.experience} experience · Available {a.availability}
                  </p>
                </div>
                {a.status === "PENDING" && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={busyId === a.id}
                      onClick={() => handleReviewApplication(a.id, "APPROVED")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/30 px-4 py-2 font-sans text-label-md text-primary hover:bg-surface-container-low disabled:opacity-50"
                    >
                      <span className="material-icon text-base">check_circle</span>
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === a.id}
                      onClick={() => handleReviewApplication(a.id, "REJECTED")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/30 px-4 py-2 font-sans text-label-md text-error hover:bg-error-container/30 disabled:opacity-50"
                    >
                      <span className="material-icon text-base">cancel</span>
                      Reject
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-headline-sm text-primary">People</h2>
          <div className="flex gap-2">
            <input
              placeholder="Search name or email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${fieldClasses} sm:w-64`}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "")}
              className={fieldClasses}
            >
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface-container-low py-16 text-center">
            <span className="material-icon text-4xl text-outline">group</span>
            <p className="font-sans text-body-sm text-on-surface-variant">No users found.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <Card key={u.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-bold text-on-surface">{u.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {u.email}
                    {u.phone ? ` — ${u.phone}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {u.technicianActive !== null && (
                    <label className="flex items-center gap-1.5 font-sans text-label-md text-on-surface-variant">
                      <input
                        type="checkbox"
                        checked={u.technicianActive}
                        disabled={busyId === u.id}
                        onChange={(e) =>
                          handleUpdateUser(u.id, { technicianActive: e.target.checked })
                        }
                      />
                      Active
                    </label>
                  )}
                  <select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => handleUpdateUser(u.id, { role: e.target.value as Role })}
                    className={`${fieldClasses} w-auto`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
