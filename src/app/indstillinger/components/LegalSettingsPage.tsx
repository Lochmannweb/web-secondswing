"use client";

import type { LegalDocument } from "@/app/Content/legal";
import { LegalDocumentView } from "@/app/components/LegalDocument/LegalDocumentView";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import "../../profil.css";
import "@/app/components/LegalDocument/legal.css";

type LegalSettingsPageProps = {
  document: LegalDocument;
  backHref?: string;
};

export function LegalSettingsPage({
  document,
  backHref = "/indstillinger/privatliv",
}: LegalSettingsPageProps) {
  const router = useRouter();

  return (
    <Box className="settings-layout settings-layout--legal">
      <Button
        onClick={() => router.push(backHref)}
        className="profil-back"
        startIcon={<NavigateBeforeIcon />}
      >
        Tilbage
      </Button>

      <Box className="settings-header">
        <p className="settings-kicker">Sikkerhed & privatliv</p>
        <h1 className="settings-title">{document.title}</h1>
        <p className="legal-updated">Senest opdateret: {document.updatedAt}</p>
      </Box>

      <LegalDocumentView document={document} />
    </Box>
  );
}
