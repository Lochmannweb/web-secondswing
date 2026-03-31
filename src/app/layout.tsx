// Server side 
export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import "./globals.css";
import ErrorBoundary from "../../ErrorBoundary";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Second Swing | Brugt golfudstyr",
  description:
    "Køb og sælg brugt golfudstyr hurtigt og enkelt med Second Swing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Providers>{children}</Providers> 
        </ErrorBoundary>
      </body>
    </html>
  );
}
