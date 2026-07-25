import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Sonsie_One } from "next/font/google";
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

export const metadata: Metadata = buildMetadata("https://example.com", {
  title: "Seepage Leakage All Solutions",
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
      className={`${plusJakartaSans.variable} ${inter.variable} ${sonsieOne.variable} h-full antialiased`}
    >
      <head>
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
