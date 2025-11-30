"use client"

import HeaderMenu from "@/components/HeaderMenu";
import "./globals.css";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <body>
        <HeaderMenu />
        {children}
      </body>
    </html>
  );
}
