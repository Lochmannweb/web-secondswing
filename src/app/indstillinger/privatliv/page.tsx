"use client";

import FaqPage from "@/app/faq/page";
import CookiePage from "@/app/cookie/page";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import "../../profil.css";

export default function PrivatlivPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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

      <Box className="settings-block">
        <CookiePage />
      </Box>

      <Box className="settings-block">
        <FaqPage />
      </Box>

      <Button
        onClick={handleLogout}
        className="profile-action-button profile-action-button--primary"
        fullWidth
      >
        Log ud
      </Button>
    </Box>
  );
}
