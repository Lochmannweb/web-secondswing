"use client";

import { tradeTerms } from "@/app/Content/legal";
import { LegalSettingsPage } from "../components/LegalSettingsPage";

export default function HandelsbetingelserSettingsPage() {
  return <LegalSettingsPage document={tradeTerms} />;
}
