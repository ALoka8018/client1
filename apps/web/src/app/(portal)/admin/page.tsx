export default function AdminPage() {
  return (
    <div className="container-max flex flex-col items-center py-section-mobile text-center md:py-section-desktop">
      <span className="material-symbols-outlined mb-6 text-6xl text-outline">
        lock
      </span>
      <h1 className="mb-4 font-display text-headline-md text-primary">
        Admin Panel — Restricted
      </h1>
      <p className="max-w-md font-sans text-body-md text-on-surface-variant">
        This area is limited to AIAS staff accounts with administrative
        permissions. If you believe you should have access, contact your
        account manager.
      </p>
    </div>
  );
}
