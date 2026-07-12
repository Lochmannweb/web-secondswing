"use client";

import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import "../../profil.css";

export default function KobSalgPage() {
  const router = useRouter();

  return (
    <Box className="settings-layout">
      <Button
        onClick={() => router.push("/indstillinger")}
        className="profil-back"
        startIcon={<NavigateBeforeIcon />}
      >
        Tilbage
      </Button>

      <Box className="settings-header">
        <p className="settings-kicker">Køb & salg</p>
        <h1 className="settings-title">Køb, salg & fragt</h1>
      </Box>

      <p className="settings-stub-text">
        Her kan du snart vælge standard fragt, håndtere tilbud og sætte præferencer for dine
        annoncer — ligesom på andre markedspladser.
      </p>

      <ul className="settings-stub-list">
        <li>Standard leveringsmetode</li>
        <li>Samler selv op / sender med</li>
        <li>Automatisk accepter tilbud</li>
        <li>Standard annonce-indstillinger</li>
      </ul>
    </Box>
  );
}
