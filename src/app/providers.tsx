'use client';

import HeaderMenu from "@/app/components/Navigation/HeaderMenu";
import SiteFooter from "@/app/components/Navigation/SiteFooter";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderMenu />
      {children}
      <SiteFooter />
    </>
  );
}
