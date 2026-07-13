"use client";

import CookieContent from "./CookieContent";
import "@/app/components/LegalDocument/legal.css";

export default function CookiePage() {
  return (
    <div className="legal-page">
      <header className="legal-page-header">
        <p className="legal-kicker">Juridisk</p>
        <h1 className="legal-title">Cookiepolitik</h1>
      </header>
      <CookieContent />
    </div>
  );
}
