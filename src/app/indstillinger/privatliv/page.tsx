"use client";

import FaqPage from "@/app/faq/page";
import CookiePage from "@/app/cookie/page";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import "../../profil.css";

export default function PrivatlivPage() {
  const router = useRouter();

  return (
    <Box className="settings-layout">
      <Button
        onClick={() => router.push("/profile")}
        className="profil-back"
        startIcon={<NavigateBeforeIcon />}
      >
        Tilbage
      </Button>

      <Box className="settings-header">
        <p className="settings-kicker">Profil</p>
        <h1 className="settings-title">Indstillinger</h1>
      </Box>

      <Box className="settings-content-grid">
        <Box className="settings-block">
          <CookiePage />
        </Box>

        <Box className="settings-block">
          <FaqPage />
        </Box>
      </Box>
    </Box>
  );
}
