"use client";

import FaqPage from "@/app/faq/page";
import CookiePage from "@/app/cookie/page";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import "./cookiePrivatliv.css";

export default function PrivatlivPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/profile");
  };

  return (
    <Box className="info-page privatliv-scroll-page cookie-privatliv-page">
      <Box sx={{ display: { xs: "flex", sm: "none" }, mb: 1 }}>
        <Button
          onClick={handleBack}
          sx={{
            color: "#d6d6d6",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            borderRadius: "6px",
            fontSize: "0.62rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            px: 1.2,
            py: 0.7,
            minWidth: "auto",
          }}
        >
          <NavigateBeforeIcon />
        </Button>
      </Box>

      <Box className="privatliv-scroll-block cookie-privatliv-block">
        <CookiePage />
      </Box>
      <Box className="privatliv-scroll-block cookie-privatliv-block">
        <FaqPage />
      </Box>
      <Box className="privatliv-scroll-block privatliv-logout-wrap cookie-privatliv-logout-wrap">
        <Button id="logout-button" className="profile-action-button" onClick={handleLogout}>
          Log ud
        </Button>
      </Box>
    </Box>
  );
}
