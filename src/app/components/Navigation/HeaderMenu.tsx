"use client"


import { useNavigationTracking } from '@/app/hooks/useNavigationTracking';
import { getSupabaseClient } from '@/app/lib/supabaseClient';
import { Box, Button, Drawer, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import { useEffect, useState } from 'react'

function HeaderMenu() {
    const supabase = getSupabaseClient()
    useNavigationTracking();

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [hydrated, setHydrated] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);


    // Tracke session
    useEffect(() => {
        setHydrated(true);

        supabase.auth.getSession().then(({ data }) => {
            setIsLoggedIn(!!data.session)
        })

        const { data: subscription } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setIsLoggedIn(!!session)
        });

        return () => subscription.subscription.unsubscribe()
    })

    if (!hydrated) return null;


    // Google-login
    async function handleGoogleLogin() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/shop`,
                queryParams: { prompt: 'select_account' }
            },
        });

        if (error) {
            console.error("Google login error: ", error.message);
        }
    }

    return (
        <>
        {/* TOP MENU */}
        <Box className="header-menu">
            <Button
                component={Link}
                href="/"
                className="header-menu-logo"
            >
                SECONDSWING
            </Button>

            <IconButton
                onClick={() => setDrawerOpen(true)}
                className="header-menu-icon-button"
            >
                <MenuIcon />
            </IconButton>
        </Box>

        {/* SLIDE-OUT DRAWER */}
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
                    <Link href="/" className="header-drawer-link" onClick={() => setDrawerOpen(false)}>
                        FORSIDEN
                    </Link>
                    <Link href="/shop" className="header-drawer-link" onClick={() => setDrawerOpen(false)}>
                        SHOP
                    </Link>


                    {isLoggedIn ? (
                        <>
                            {/* <Link href="/opretProdukt" className="header-drawer-link" onClick={() => setDrawerOpen(false)}>
                                SÆLG UDSTYR
                            </Link> */}
                            <Link href="/favoriter" className="header-drawer-link" onClick={() => setDrawerOpen(false)}>
                                FAVORITTER
                            </Link>
                            <Link href="/profile" className="header-drawer-link" onClick={() => setDrawerOpen(false)}>
                                PROFIL
                            </Link>
                        </>
                    ) : (
                        <button
                            className="header-drawer-link header-drawer-login"
                            onClick={() => { setDrawerOpen(false); handleGoogleLogin(); }}
                        >
                            LOG IND
                        </button>
                    )}
                    <Link href="/about" className="header-drawer-link" onClick={() => setDrawerOpen(false)}>
                        OM OS
                    </Link>
                </nav>
            </Box>
        </Drawer>
        </>
    )
}

export default HeaderMenu

