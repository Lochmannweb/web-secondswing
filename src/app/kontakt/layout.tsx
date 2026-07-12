"use client";

import { usePageFitViewport } from "@/app/hooks/usePageFitViewport";
import "./kontakt.css";

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  usePageFitViewport();
  return children;
}
