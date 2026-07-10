// Server side
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";

import "./globals.css";
import ErrorBoundary from "../../ErrorBoundary";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Second Swing | Brugt golfudstyr",
  description:
    "Køb og sælg brugt golfudstyr hurtigt og enkelt med Second Swing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="da"
      data-theme="light"
      className={`${playfair.variable} ${dmSans.variable}`}
    >
      <body>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
