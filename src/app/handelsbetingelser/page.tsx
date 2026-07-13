"use client";

import { tradeTerms } from "@/app/Content/legal";
import { LegalStandalonePage } from "@/app/components/LegalDocument/LegalDocumentView";

export default function HandelsbetingelserPage() {
  return <LegalStandalonePage document={tradeTerms} />;
}
