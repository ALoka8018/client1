"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@repo/ui/cn";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

const TYPE_ICONS: Record<string, string> = {
  BOOKING_STATUS_CHANGED: "event_available",
  INVOICE_PAID: "payments",
  SUPPORT_TICKET_REPLY: "support_agent",
};

const POLL_INTERVAL_MS = 60_000;

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMin = Math.round((Date.now() - date.getTime()) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : null;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      const headers = await getAuthHeader();
      if (!headers || cancelled) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/notifications`, {
          headers,
        });
        if (!res.ok || cancelled) return;

        const data = await res.json();
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      } catch {
        // Silent — the badge just won't update this cycle.
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    const headers = await getAuthHeader();
    if (!headers) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/notifications/${id}/read`, {
      method: "PATCH",
      headers,
    }).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    const headers = await getAuthHeader();
    if (!headers) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/notifications/read-all`, {
      method: "PATCH",
      headers,
    }).catch(() => {});
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="glass absolute top-12 right-0 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-white/50 shadow-level-1">
          <div className="flex items-center justify-between border-b border-outline-variant/30 px-4 py-3">
            <h4 className="font-display text-label-lg text-primary">Notifications</h4>
            {unreadCount > 0 && (
              <button
                type="button"
                className="font-sans text-xs font-bold text-primary hover:underline"
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center font-sans text-body-sm text-on-surface-variant">
                You&apos;re all caught up.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.read && markRead(n.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-outline-variant/20 px-4 py-3 text-left transition-colors last:border-none hover:bg-surface-container-low",
                    !n.read && "bg-primary/5",
                  )}
                >
                  <span className="material-symbols-outlined mt-0.5 text-primary">
                    {TYPE_ICONS[n.type] ?? "notifications"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-body-sm font-bold text-on-surface">{n.title}</p>
                    <p className="line-clamp-2 font-sans text-xs text-on-surface-variant">
                      {n.body}
                    </p>
                    <p className="mt-1 font-sans text-[11px] text-outline">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
