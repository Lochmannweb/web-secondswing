"use client";

import { privacyPolicy } from "@/app/Content/legal";
import { LegalStandalonePage } from "@/app/components/LegalDocument/LegalDocumentView";

export default function PrivatlivspolitikPage() {
  return <LegalStandalonePage document={privacyPolicy} />;
}
