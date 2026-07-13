"use client";

import CookieContent from "@/app/cookie/CookieContent";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import "../../profil.css";

export default function CookiesSettingsPage() {
  const router = useRouter();

  return (
    <Box className="settings-layout">
      <Button
        onClick={() => router.push("/indstillinger/privatliv")}
        className="profil-back"
        startIcon={<NavigateBeforeIcon />}
      >
        Tilbage
      </Button>

      <Box className="settings-header">
        <p className="settings-kicker">Sikkerhed & privatliv</p>
        <h1 className="settings-title">Cookiepolitik</h1>
      </Box>

      <Box className="settings-block">
        <CookieContent />
      </Box>
    </Box>
  );
}
