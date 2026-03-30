"use client"


import { useNavigationTracking } from '@/app/hooks/useNavigationTracking';
import { getSupabaseClient } from '@/app/lib/supabaseClient';
import { Box, Button, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material'
import Link from 'next/link';
import { useEffect, useState } from 'react'

function HeaderMenu() {
    const supabase = getSupabaseClient()
    useNavigationTracking();
   

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [hydrated, setHydrated] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    
    // menu state (mobil)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
    };
    const handleClose = () => setAnchorEl(null);


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
        <Box className="header-menu" >
            <Box alignSelf={"center"}>
                <Button 
                    component={Link}
                    href="/" 
                    className="header-menu-logo"
                >
                    <p>Second Swing</p>
                </Button>
            </Box>

            <Box className="header-menu-container">
                {!isMobile && (
                    <>
                        <Button 
                            href="/shop" 
                            component={Link}
                            className="header-menu-nav-link">
                            Shop
                        </Button>
                        <Button 
                            href="/about" 
                            component={Link}
                            className="header-menu-nav-link">
                            Om os
                        </Button>
                        {isLoggedIn && (
                            <Button 
                                href="/favoriter" 
                                component={Link}
                                className="header-menu-nav-link">
                                Favoritter
                            </Button>
                        )}
                    </>
                )}

                {isLoggedIn ? (
                        <>
                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Button
                                        href='/profile?section=createProduct'
                                        component={Link}
                                        className="header-menu-sell-button"
                                    >
                                        Sælg udstyr
                                    </Button>
                                    <Button
                                        href='/profile'
                                        component={Link}
                                        className="header-menu-profile-button"
                                    >
                                        Profil
                                    </Button>
                                </>
                            )}

                            {/* MOBIL */}
                            {isMobile && (
                                <>
                                    <Button
                                        onClick={handleOpen}
                                        className="header-menu-profile-mobile"
                                    >
                                        Profil
                                    </Button>

                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                        sx={{ 
                                            "& .MuiList-root": {
                                                backgroundColor: "#131313ff",
                                                color: "gray",
                                                width: "15vh",
                                                padding: 0
                                            }
                                        }}
                                    >
                                        <MenuItem
                                            component={Link}
                                            href="/profile"
                                            onClick={handleClose}
                                        >
                                            Profil
                                        </MenuItem>
                                        <MenuItem
                                            component={Link}
                                            href="/shop"
                                            onClick={handleClose}
                                        >
                                            Shop
                                        </MenuItem>
                                        <MenuItem
                                            component={Link}
                                            href="/favoriter"
                                            onClick={handleClose}
                                        >
                                            Favoriter
                                        </MenuItem>
                                        <MenuItem
                                            component={Link}
                                            href="/about"
                                            onClick={handleClose}
                                        >
                                            Om os
                                        </MenuItem>
                                        <MenuItem
                                            component={Link}
                                            href="/faq"
                                            onClick={handleClose}
                                        >
                                            FAQ
                                        </MenuItem>
                                        <MenuItem
                                            component={Link}
                                            href="/kontakt"
                                            onClick={handleClose}
                                        >
                                            Kontakt
                                        </MenuItem>
                                        <MenuItem
                                            component={Link}
                                            href="/saelger"
                                            onClick={handleClose}
                                        >
                                            Saelgerguide
                                        </MenuItem>
                                        <MenuItem
                                            component={Link}
                                            href="/profile?section=createProduct"
                                            onClick={handleClose}
                                        >
                                            Sælg udstyr
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}
                        </>
                ) : (
                    <div>
                        <Button
                            className="header-menu-login-button"
                            onClick={handleGoogleLogin}
                        >
                            Log ind
                        </Button>
                    </div>
                )}
            </Box>
        </Box>
        </>
    )
}

export default HeaderMenu
