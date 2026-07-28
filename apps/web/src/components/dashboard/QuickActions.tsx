import Link from "next/link";

const ACTIONS = [
  { href: "/book", icon: "add_task", label: "Book New", accent: false },
  { href: "/book", icon: "request_quote", label: "Request Quote", accent: false },
  { href: "/bookings", icon: "receipt_long", label: "Pay Invoice", accent: true },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="glass group flex flex-col items-center gap-4 rounded-3xl p-6 transition-all hover:bg-primary-container/5"
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
              action.accent
                ? "bg-secondary-container/10 text-secondary"
                : "bg-primary-container/10 text-primary"
            }`}
          >
            <span className="material-icon text-3xl">
              {action.icon}
            </span>
          </div>
          <span
            className={`font-sans text-label-md ${
              action.accent ? "text-secondary" : "text-primary"
            }`}
          >
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
