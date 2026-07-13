"use client";

import { termsOfUse } from "@/app/Content/legal";
import { LegalStandalonePage } from "@/app/components/LegalDocument/LegalDocumentView";

export default function BrugervilkarPage() {
  return <LegalStandalonePage document={termsOfUse} />;
}
