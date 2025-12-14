'use client';

import HeaderMenu from "@/app/components/Navigation/HeaderMenu";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderMenu />
      {children}
    </>
  );
}
