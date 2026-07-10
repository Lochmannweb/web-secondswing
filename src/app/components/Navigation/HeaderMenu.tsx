"use client";

import { useNavigationTracking } from "@/app/hooks/useNavigationTracking";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import { Box, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function HeaderMenu() {
  const supabase = getSupabaseClient();
  const pathname = usePathname();
  const isHome = pathname === "/";
  useNavigationTracking();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, [supabase.auth]);

  if (!hydrated) return null;

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/shop`,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      console.error("Google login error: ", error.message);
    }
  }

  return (
    <>
      <header className={`site-header${isHome ? " site-header--hero" : ""}`}>
        <nav className="site-header-left" aria-label="Primær navigation">
          {isLoggedIn ? (
            <Link href="/profile" className="site-header-link">
              PROFIL
            </Link>
          ) : (
            <button
              type="button"
              className="site-header-link site-header-login"
              onClick={handleGoogleLogin}
            >
              LOG IND
            </button>
          )}
          <Link href="/shop" className="site-header-link">
            SHOP
          </Link>
        </nav>

        <div className="site-header-center">
          <Link href="/" className="site-header-logo">
            SECONDSWING
          </Link>
          <p className="site-header-tagline">BRUGT GOLFUDSTYR</p>
        </div>

        <div className="site-header-right">
          <Link href="/opretProdukt" className="site-header-cta">
            OPRET ANNONCE
          </Link>
          <button
            type="button"
            className="site-header-menu-btn"
            aria-label="Åbn menu"
            onClick={() => setDrawerOpen(true)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className="header-drawer"
        PaperProps={{ className: "header-drawer-paper" }}
      >
        <Box className="header-drawer-inner">
          <Box className="header-drawer-top">
            <IconButton
              onClick={() => setDrawerOpen(false)}
              className="header-drawer-close"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <nav className="header-drawer-nav">
            <Link
              href="/"
              className="header-drawer-link"
              onClick={() => setDrawerOpen(false)}
            >
              FORSIDEN
            </Link>
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="header-drawer-link"
                onClick={() => setDrawerOpen(false)}
              >
                PROFIL
              </Link>
            ) : (
              <button
                className="header-drawer-link header-drawer-login"
                onClick={() => {
                  setDrawerOpen(false);
                  handleGoogleLogin();
                }}
              >
                LOG IND
              </button>
            )}
            <Link
              href="/shop"
              className="header-drawer-link"
              onClick={() => setDrawerOpen(false)}
            >
              SHOP
            </Link>

            {isLoggedIn && (
              <Link
                href="/chats"
                className="header-drawer-link"
                onClick={() => setDrawerOpen(false)}
              >
                CHAT HISTORIK
              </Link>
            )}
            <Link
              href="/opretProdukt"
              className="header-drawer-link"
              onClick={() => setDrawerOpen(false)}
            >
              OPRET ANNONCE
            </Link>
          </nav>
        </Box>
      </Drawer>
    </>
  );
}

export default HeaderMenu;
