import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Sonsie_One, Archivo } from "next/font/google";
import { buildMetadata } from "@repo/seo";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sonsieOne = Sonsie_One({
  variable: "--font-sonsie-one",
  subsets: ["latin"],
  weight: ["400"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["800", "900"],
});

export const metadata: Metadata = buildMetadata("https://example.com", {
  title: "Seepage Doctor",
  description:
    "Advanced leak detection, structural diagnostics, and precision engineering solutions.",
  path: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${sonsieOne.variable} ${archivo.variable} h-full antialiased`}
    >
      <head>
        {/* Used for its @font-face only. We style icons with our own
            `.material-icon` class because this sheet's own rule is unlayered and
            would outrank every Tailwind utility. See globals.css. */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
