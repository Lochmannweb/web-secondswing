'use client';

import HeaderMenu from "@/app/components/Navigation/HeaderMenu";
import SiteFooter from "@/app/components/Navigation/SiteFooter";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <HeaderMenu />
      <main className="site-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
