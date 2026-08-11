import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_TAGLINE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="min-h-dvh bg-background font-sans text-text-primary">
        <div className="relative isolate min-h-dvh overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-15%,rgba(34,211,238,0.09),transparent_42%)]"
          />
          {children}
        </div>
      </body>
    </html>
  );
}
