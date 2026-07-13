"use client";

import { termsOfUse } from "@/app/Content/legal";
import { LegalSettingsPage } from "../components/LegalSettingsPage";

export default function BrugervilkarSettingsPage() {
  return <LegalSettingsPage document={termsOfUse} />;
}
