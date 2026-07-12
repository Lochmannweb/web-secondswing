"use client";

import { usePageFitViewport } from "@/app/hooks/usePageFitViewport";
import "./faq.css";

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  usePageFitViewport();
  return <div className="faq-route">{children}</div>;
}
