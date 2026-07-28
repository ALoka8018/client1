"use client";

import { useEffect, useState } from "react";
import { cn } from "@repo/ui/cn";
import { Card } from "@repo/ui/Card";
import { Button } from "@repo/ui/Button";
import { Textarea } from "@repo/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { BOOKING_STATUS_META, type BookingStatus } from "@/lib/bookingStatus";

const ACTIVE_STATUSES: BookingStatus[] = ["EN_ROUTE", "IN_PROGRESS"];
const PENDING_STATUSES: BookingStatus[] = ["REQUESTED", "CONFIRMED", "ASSIGNED"];

type Job = {
  id: string;
  code: string;
  status: BookingStatus;
  scheduledAt: string;
  problemDescription: string;
  service: { title: string } | null;
  property: { addressLine: string; city: string };
  user: { name: string; phone: string | null };
};

type NextAction = { action: "en_route" | "arrived" | "completed"; label: string } | null;

function nextActionFor(status: BookingStatus): NextAction {
  switch (status) {
    case "REQUESTED":
    case "CONFIRMED":
    case "ASSIGNED":
      return { action: "en_route", label: "Mark En Route" };
    case "EN_ROUTE":
      return { action: "arrived", label: "Mark Arrived" };
    case "IN_PROGRESS":
      return { action: "completed", label: "Mark Completed" };
    default:
      return null;
  }
}

function formatScheduled(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

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
      <h1 className="mb-4 font-display text-headline-md text-primary">Technician Access Only</h1>
      <p className="max-w-md font-sans text-body-md text-on-surface-variant">
        This area is limited to Seepage Leakage All Solutions technician accounts. If you believe
        you should have access, contact your account manager.
      </p>
    </div>
  );
}

function formatToday() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function TechnicianPage() {
  const [roleChecked, setRoleChecked] = useState(false);
  const [isTechnician, setIsTechnician] = useState(false);
  const [technicianName, setTechnicianName] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [materialsDrafts, setMaterialsDrafts] = useState<Record<string, string>>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({});
  const [uploadPhotoType, setUploadPhotoType] = useState<Record<string, "BEFORE" | "AFTER">>({});

  const loadJobs = async () => {
    setJobsLoading(true);
    const headers = await getAuthHeader();
    if (!headers) {
      setJobsLoading(false);
      return;
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/technician/jobs`, { headers });
    if (res.ok) {
      const data = (await res.json()) as Job[];
      setJobs(Array.isArray(data) ? data : []);
    }
    setJobsLoading(false);
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
        setIsTechnician(me.role === "TECHNICIAN");
        setTechnicianName(me.name ?? "");
        if (me.role === "TECHNICIAN") await loadJobs();
      }
      setRoleChecked(true);
    })();
  }, []);

  const handleAction = async (job: Job, action: "en_route" | "arrived" | "completed") => {
    setActionError(null);
    setActionLoadingId(job.id);

    try {
      const headers = await getAuthHeader();
      if (!headers) {
        setActionError("Your session expired. Please sign in again.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/technician/jobs/${job.id}/status`,
        {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            note: noteDrafts[job.id] || undefined,
            materialsUsed: action === "completed" ? materialsDrafts[job.id] || undefined : undefined,
          }),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setActionError(body?.error ?? "Could not update the job. Please try again.");
        return;
      }

      const updated = (await res.json()) as Job;
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: updated.status } : j)));
      setNoteDrafts((prev) => ({ ...prev, [job.id]: "" }));
    } catch {
      setActionError("Could not reach the server. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpload = async (job: Job) => {
    const file = uploadFiles[job.id];
    if (!file) return;

    setUploadingId(job.id);
    setActionError(null);

    try {
      const headers = await getAuthHeader();
      if (!headers) {
        setActionError("Your session expired. Please sign in again.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("photoType", uploadPhotoType[job.id] ?? "BEFORE");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/bookings/${job.id}/attachments`,
        { method: "POST", headers, body: formData },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setActionError(body?.error ?? "Upload failed. Please try again.");
        return;
      }

      setUploadFiles((prev) => ({ ...prev, [job.id]: null }));
    } catch {
      setActionError("Could not reach the server. Please try again.");
    } finally {
      setUploadingId(null);
    }
  };

  if (!roleChecked) {
    return (
      <div className="container-max py-section-mobile text-center md:py-section-desktop">
        <p className="text-on-surface-variant">Checking access…</p>
      </div>
    );
  }

  if (!isTechnician) {
    return <Restricted />;
  }

  const pendingCount = jobs.filter((j) => PENDING_STATUSES.includes(j.status)).length;
  const activeCount = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status)).length;
  const doneCount = jobs.filter((j) => j.status === "COMPLETED").length;

  const sortedJobs = [...jobs].sort((a, b) => {
    const aActive = ACTIVE_STATUSES.includes(a.status) ? 0 : 1;
    const bActive = ACTIVE_STATUSES.includes(b.status) ? 0 : 1;
    return aActive - bActive;
  });

  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <div className="mb-6">
        <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
          Hello{technicianName ? `, ${technicianName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 font-sans text-body-sm text-on-surface-variant">
          {formatToday()} · You have {jobs.length} job{jobs.length === 1 ? "" : "s"} today
        </p>
      </div>

      {!jobsLoading && jobs.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="font-display text-headline-md text-primary tabular-nums">
              {pendingCount}
            </p>
            <p className="font-sans text-label-md text-on-surface-variant">Pending</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="font-display text-headline-md text-secondary tabular-nums">
              {activeCount}
            </p>
            <p className="font-sans text-label-md text-on-surface-variant">Ongoing</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="font-display text-headline-md text-primary tabular-nums">{doneCount}</p>
            <p className="font-sans text-label-md text-on-surface-variant">Done</p>
          </Card>
        </div>
      )}

      {actionError && (
        <p className="mb-6 font-sans text-body-sm text-error" role="alert">
          {actionError}
        </p>
      )}

      {jobsLoading ? (
        <p className="text-on-surface-variant">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface-container-low py-16 text-center">
          <span className="material-icon text-4xl text-outline">event_available</span>
          <p className="font-sans text-body-md text-on-surface-variant">
            No jobs assigned to you right now.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-xl space-y-6">
          {sortedJobs.map((job) => {
            const meta = BOOKING_STATUS_META[job.status];
            const next = nextActionFor(job.status);
            const isActive = ACTIVE_STATUSES.includes(job.status);

            return (
              <Card
                key={job.id}
                className={cn(
                  "p-6",
                  isActive && "bg-primary text-on-primary shadow-level-2",
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    {isActive && (
                      <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                        Active Now
                      </span>
                    )}
                    {!isActive && (
                      <span
                        className={cn(
                          "mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                          meta.badgeClass,
                        )}
                      >
                        {meta.label}
                      </span>
                    )}
                    <h3
                      className={cn(
                        "font-display text-headline-sm",
                        isActive ? "text-on-primary" : "text-primary",
                      )}
                    >
                      {job.service?.title ?? "Service Request"}
                    </h3>
                    <p
                      className={cn(
                        "text-sm",
                        isActive ? "text-on-primary/70" : "text-on-surface-variant",
                      )}
                    >
                      {job.code} • {formatScheduled(job.scheduledAt)}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "mb-4 space-y-2 rounded-2xl p-4 text-sm",
                    isActive ? "bg-white/10" : "bg-surface-container-low",
                  )}
                >
                  <p className="flex items-center gap-2">
                    <span className="material-icon text-base">person</span>
                    {job.user.name}
                    {job.user.phone ? ` • ${job.user.phone}` : ""}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-icon text-base">location_on</span>
                    {job.property.addressLine}, {job.property.city}
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="material-icon text-base">build</span>
                    {job.problemDescription}
                  </p>
                </div>

                {next && (
                  <div className="mb-4 space-y-3">
                    <Textarea
                      rows={2}
                      placeholder="Add a note (optional)…"
                      value={noteDrafts[job.id] ?? ""}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({ ...prev, [job.id]: e.target.value }))
                      }
                    />
                    {next.action === "completed" && (
                      <Textarea
                        rows={2}
                        placeholder="Materials used (optional)…"
                        value={materialsDrafts[job.id] ?? ""}
                        onChange={(e) =>
                          setMaterialsDrafts((prev) => ({ ...prev, [job.id]: e.target.value }))
                        }
                      />
                    )}
                    <Button
                      type="button"
                      variant="accent"
                      fullWidth
                      disabled={actionLoadingId === job.id}
                      onClick={() => handleAction(job, next.action)}
                    >
                      {actionLoadingId === job.id ? "Updating…" : next.label}
                    </Button>
                  </div>
                )}

                <div
                  className={cn(
                    "space-y-2 border-t pt-4",
                    isActive ? "border-white/20" : "border-outline-variant/30",
                  )}
                >
                  <p
                    className={cn(
                      "flex items-center gap-1.5 font-sans text-label-md",
                      isActive ? "text-on-primary/70" : "text-on-surface-variant",
                    )}
                  >
                    <span className="material-icon text-base">add_a_photo</span>
                    Upload a photo
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setUploadFiles((prev) => ({
                          ...prev,
                          [job.id]: e.target.files?.[0] ?? null,
                        }))
                      }
                      className={cn(
                        "flex-1 font-sans text-xs",
                        isActive ? "text-on-primary/70" : "text-on-surface-variant",
                      )}
                    />
                    <select
                      value={uploadPhotoType[job.id] ?? "BEFORE"}
                      onChange={(e) =>
                        setUploadPhotoType((prev) => ({
                          ...prev,
                          [job.id]: e.target.value as "BEFORE" | "AFTER",
                        }))
                      }
                      className="rounded-xl border-none bg-surface-container-low px-3 py-2 font-sans text-xs text-on-surface outline-none"
                    >
                      <option value="BEFORE">Before</option>
                      <option value="AFTER">After</option>
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant={isActive ? "outline-inverse" : "outline"}
                    size="sm"
                    fullWidth
                    disabled={!uploadFiles[job.id] || uploadingId === job.id}
                    onClick={() => handleUpload(job)}
                  >
                    {uploadingId === job.id ? "Uploading…" : "Upload"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
