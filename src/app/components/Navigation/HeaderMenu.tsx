"use client"


import { useNavigationTracking } from '@/app/hooks/useNavigationTracking';
import { getSupabaseClient } from '@/app/lib/supabaseClient';
import { Box, Button, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material'
import Link from 'next/link';
import { useEffect, useState } from 'react'
import { div } from 'three/tsl';

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
                    sx={{ 
                        color: "white", 
                        padding: 0,
                        fontSize: { xs: "10px", sm: "0.7rem" }, 
                        textTransform: "uppercase",
                        "&:hover": { 
                            backgroundColor: "transparent", 
                        } 
                    }}
                >
                    <p>Second Swing</p>
                </Button>
            </Box>

            <Box sx={{ display: "flex" }}>
                {!isMobile && isLoggedIn && (
                    <>
                        <Button 
                            href="/shop" 
                            startIcon={
                                <img src="/ikoner/home.png" alt="home" width={20} height={20} />
                            }
                            component={Link}
                            sx={{ 
                                color: "white", 
                                padding: 0,
                                fontSize: { xs: "0.5rem", sm: "0.7rem" },
                                "&:hover": { 
                                    backgroundColor: "transparent", 
                                } 
                            }}>
                        </Button>
                        <Button 
                            href="/favoriter" 
                            startIcon={
                                <img src="/ikoner/fav.png" alt="fav" width={20} height={20} />
                            }
                            component={Link}
                            sx={{ 
                                color: "white", 
                                padding: 0,
                                fontSize: { xs: "0.5rem", sm: "0.7rem" },
                                "&:hover": { 
                                    backgroundColor: "transparent", 
                                } 
                            }}>
                        </Button>
                    </>
                )}

                {isLoggedIn ? (
                        <>
                            {/* DESKTOP */}
                            {!isMobile && (
                                <Button
                                    href='/profile'
                                    startIcon={
                                        <img src="/ikoner/profile.png" alt="profile" width={20} height={20} />
                                    }
                                    component={Link}
                                    sx={{ 
                                        color: "white", 
                                        padding: 0,
                                        fontSize: { xs: "0.5rem", sm: "0.7rem" },
                                        "&:hover": { 
                                            backgroundColor: "transparent", 
                                        }
                                    }}
                                >
                                </Button>
                            )}

                            {/* MOBIL */}
                            {isMobile && (
                                <>
                                    <Button
                                        onClick={handleOpen}
                                        sx={{
                                            color: "white",
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
                    <div>
                        <Button
                            startIcon={
                                <img src="/ikoner/profile.png" alt="login" width={20} height={20} />
                            }
                            sx={{ color: "white", fontSize: { xs: "10px", sm: "0.7rem" }, }}
                            onClick={handleGoogleLogin}
                        >
                        </Button>
                    </div>
                    // <div>
                    //     <Button
                    //         startIcon={
                    //             <img src="/ikoner/profile.png" alt="login" width={10} height={10} />
                    //         }
                    //         sx={{ color: "white", fontSize: { xs: "10px", sm: "0.7rem" }, }}
                    //         onClick={handleGoogleLogin}
                    //     >
                    //         Login
                    //     </Button>
                    //     |
                    //     <Button
                    //         sx={{ color: "white", fontSize: { xs: "10px", sm: "0.7rem" }, }}
                    //         onClick={handleGoogleLogin}
                    //     >
                    //         Signup
                    //     </Button>
                    // </div>
                )}
            </Box>
        </Box>
        </>
    )
}

export default HeaderMenu
