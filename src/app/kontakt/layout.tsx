"use client";

import { useEffect } from "react";

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("kontakt-route");
    return () => document.body.classList.remove("kontakt-route");
  }, []);

  return children;
}
