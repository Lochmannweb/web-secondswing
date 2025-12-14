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
        <Box 
            sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                gap: 2, 
                zIndex: 10, 
                position: "absolute", 
                padding: 2, 
                width: "100%",  
                backgroundColor: "#00000070"
            }}
        >
            <Box>
                <Button 
                    component={Link}
                    href="/" 
                    sx={{ 
                        color: "white", 
                        borderBottom: "1px solid white", 
                        fontSize: { xs: "0.5rem", sm: "0.7rem" }, 
                        "&:hover": { 
                            backgroundColor: "transparent", 
                            borderBottom: "1px solid darkgreen",
                        } 
                    }}
                >Second Swing</Button>
            </Box>

            <Box sx={{ display: "flex", gap: "1rem" }}>
                {!isMobile && (
                    <>
                        <Button 
                            component={Link}
                            href="/about" 
                            sx={{ 
                                color: "white", 
                                borderBottom: "1px solid white",
                                fontSize: { xs: "0.5rem", sm: "0.7rem" },
                                "&:hover": { 
                                    backgroundColor: "transparent", 
                                    borderBottom: "1px solid darkgreen" 
                                }  
                            }}>
                                Om os
                        </Button>
                        
                        <Button 
                            href="/shop" 
                            component={Link}
                            sx={{ 
                                color: "white", 
                                borderBottom: "1px solid white",
                                fontSize: { xs: "0.5rem", sm: "0.7rem" },
                                "&:hover": { 
                                    backgroundColor: "transparent", 
                                    borderBottom: "1px solid darkgreen" 
                                } 
                            }}>
                                Shop
                        </Button>
                        {isLoggedIn ? (
                            <Button 
                                href="/favoriter" 
                                component={Link}
                                sx={{ 
                                    color: "white", 
                                    borderBottom: "1px solid white",
                                    fontSize: { xs: "0.5rem", sm: "0.7rem" },
                                    "&:hover": { 
                                        backgroundColor: "transparent", 
                                        borderBottom: "1px solid darkgreen" 
                                    } 
                                }}>
                                    Favoriter
                            </Button>
                        ) : ( <></> )}
                    </>
                )}

            </Box>

            <Box sx={{ display: "flex", gap: "1rem" }}>
                {isLoggedIn ? (
                        <>
                            {/* DESKTOP */}
                            {!isMobile && (
                                <Button
                                    href='/profile'
                                    component={Link}
                                    sx={{ 
                                        color: "white", 
                                        borderBottom: "1px solid white",
                                        fontSize: { xs: "0.5rem", sm: "0.7rem" },
                                        "&:hover": { 
                                            backgroundColor: "transparent", 
                                            borderBottom: "1px solid darkgreen" 
                                        }
                                    }}
                                >
                                    Profil
                                </Button>
                            )}

                            {/* MOBIL */}
                            {isMobile && (
                                <>
                                    <Button
                                        onClick={handleOpen}
                                        sx={{
                                            color: "white",
                                            borderBottom: "1px solid white",
                                            fontSize: { xs: "0.5rem", sm: "1rem" },
                                        }}
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
                                            Om us
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}
                        </>
                ) : (
                    <Button
                        sx={{ color: "white", borderBottom: "1px solid white", fontSize: { xs: "0.5rem", sm: "0.7rem" }, }}
                        onClick={handleGoogleLogin}
                    >
                        Login / Signup
                    </Button>
                )}
            </Box>
        </Box>
        </>
    )
}

export default HeaderMenu
