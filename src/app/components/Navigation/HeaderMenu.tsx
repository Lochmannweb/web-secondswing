"use client"


import { getSupabaseClient } from '@/app/lib/supabaseClient';
import { Box, Button, Menu, MenuItem } from '@mui/material'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

function HeaderMenu() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const supabase = getSupabaseClient()
    const menuOpen = Boolean(anchorEl)

    const router = useRouter();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const handleNav = (link: string) => {
        if (isMobile) {
            // mobil → normal navigation
            router.push(link)
        } else {
            // desktop → ingen reload, bare navigation
            router.push(link) 
            handleProfileClose()
        }
    }

    // Tracke session
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setIsLoggedIn(!!data.session)
        })

        const { data: subscription } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setIsLoggedIn(!!session)
        });

        return () => subscription.subscription.unsubscribe()
    })


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


    const handleProfileClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleProfileClose = () => {
        setAnchorEl(null)
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
            }}
        >
            <Box>
                <Button 
                    href="/" 
                    sx={{ 
                        color: "white", 
                        borderBottom: "1px solid white", 
                        fontSize: { xs: "0.5rem", sm: "1rem" }, 
                        "&:hover": { 
                            backgroundColor: "transparent", 
                            borderBottom: "1px solid darkgreen",
                        } 
                    }}
                >Second Swing</Button>
            </Box>

            <Box sx={{ display: "flex", gap: "1rem" }}>
                <Button 
                    href="/about" 
                    sx={{ 
                        color: "white", 
                        borderBottom: "1px solid white",
                        fontSize: { xs: "0.5rem", sm: "1rem" },
                        "&:hover": { 
                            backgroundColor: "transparent", 
                            borderBottom: "1px solid darkgreen" 
                        }  
                    }}>
                        Om os
                </Button>

                <Button 
                    href="/shop" 
                    sx={{ 
                        color: "white", 
                        borderBottom: "1px solid white",
                        fontSize: { xs: "0.5rem", sm: "1rem" },
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
                        sx={{ 
                            color: "white", 
                            borderBottom: "1px solid white",
                            fontSize: { xs: "0.5rem", sm: "1rem" },
                            "&:hover": { 
                                backgroundColor: "transparent", 
                                borderBottom: "1px solid darkgreen" 
                            } 
                        }}>
                            Favoriter
                    </Button>
                ) : ( <></> )}
            </Box>

            <Box sx={{ display: "flex", gap: "1rem" }}>
                {isLoggedIn ? (
                    <>
                        <Button
                            // onClick={handleProfileClick}
                            href='/profile'
                            sx={{ 
                                color: "white", 
                                borderBottom: "1px solid white",
                                fontSize: { xs: "0.5rem", sm: "1rem" },
                                "&:hover": { 
                                    backgroundColor: "transparent", 
                                    borderBottom: "1px solid darkgreen" 
                                }
                            }}
                        >
                            Profil
                        </Button>

                        {/* <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleProfileClose}
                            MenuListProps={{ sx: { backgroundColor: "black", color: "white", display: "grid", gap: "1rem" } }}
                        >
                            <MenuItem onClick={() => handleNav("/profile")} sx={{ "&:hover": { backgroundColor: "#00ff001c" } }}>Se profil</MenuItem>
                            <MenuItem component="a" href="/produkter" sx={{ "&:hover": { backgroundColor: "#00ff001c" } }}>Mine produkter</MenuItem>
                            <MenuItem component="a" href="/favoriter" sx={{ "&:hover": { backgroundColor: "#00ff001c" } }}>Favoritter</MenuItem>
                        </Menu> */}
                    </>
                ) : (
                    <Button
                        sx={{ color: "white", borderBottom: "1px solid white", fontSize: { xs: "0.5rem", sm: "1rem" }, }}
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
