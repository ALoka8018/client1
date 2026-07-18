export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-surface-container-low px-margin-mobile py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/5 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary-container/10 blur-[120px]"
      />
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </main>
  );
}
