"use client";

import FaqPage from "@/app/faq/page";
import CookiePage from "@/app/cookie/page";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
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

  return (
    <Box className="info-page privatliv-scroll-page cookie-privatliv-page">
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
