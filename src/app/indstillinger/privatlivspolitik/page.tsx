"use client";

import { privacyPolicy } from "@/app/Content/legal";
import { LegalSettingsPage } from "../components/LegalSettingsPage";

export default function PrivatlivspolitikSettingsPage() {
  return <LegalSettingsPage document={privacyPolicy} />;
}
