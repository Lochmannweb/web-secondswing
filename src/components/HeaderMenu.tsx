'use client'

import { Box, Button, Menu, MenuItem } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function HeaderMenu() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setIsLoggedIn(!!data.session)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    async function handleGoogleLogin() {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/shop`,
                queryParams: { prompt: 'select_account' },
                skipBrowserRedirect: false,
            }
        })
    }

    return (
        <Box 
            sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                gap: 2, 
                zIndex: 10, 
                position: "absolute", 
                padding: 2, 
                width: "100%",  
            }}>
            <Box>
                <Button 
                    href="/" 
                    sx={{ 
                        color: "white", 
                        borderBottom: "1px solid white", 
                        fontSize: { xs: "0.5rem", sm: "0.7rem" }, 
                        "&:hover": { 
                            backgroundColor: "transparent", 
                            borderBottom: "1px solid darkgreen" 
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
                        fontSize: { xs: "0.5rem", sm: "0.7rem" },
                        "&:hover": { 
                            backgroundColor: "transparent",
                            borderBottom: "1px solid darkgreen" 
                        } 
                    }}>About</Button>
                <Button 
                    href="/shop" 
                    sx={{ 
                        color: "white", 
                        fontSize: { xs: "0.5rem", sm: "0.7rem" },
                        borderBottom: "1px solid white", 
                        "&:hover": { 
                            backgroundColor: "transparent", 
                            borderBottom: "1px solid darkgreen" 
                        } 
                    }}>Shop</Button>
            </Box>

            <Box sx={{ display: "flex", gap: "1rem" }}>
                {isLoggedIn ? (
                    <>
                        <Button
                            onClick={handleClick}
                            sx={{
                            color: "white",
                            borderBottom: "1px solid white",
                            fontSize: { xs: "0.5rem", sm: "0.7rem" },
                            "&:hover": {
                                backgroundColor: "transparent",
                                borderBottom: "1px solid darkgreen",
                            },
                            }}
                        >
                            Profile
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{ sx: { backgroundColor: "#0f0f0fff", color: "white" } }}
                        >
                            <MenuItem onClick={handleClose} component="a" href="/profile">
                                Se profil
                            </MenuItem>
                            <MenuItem onClick={handleClose} component="a" href="/indstillinger/profiloplysninger">
                                Rediger profil
                            </MenuItem>
                            <MenuItem onClick={handleClose} component="a" href="/favoriter">
                                Favoritter
                            </MenuItem>
                            <MenuItem onClick={handleClose} component="a" href="/chat">
                                Chat historik
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    <>
                        <Button
                            sx={{ 
                                color: "white", 
                                fontSize: { xs: "0.5rem", sm: "0.7rem" }, 
                                borderBottom: "1px solid white", 
                                "&:hover": { 
                                    backgroundColor: "transparent", 
                                    borderBottom: "1px solid darkgreen" 
                                }
                            }}
                            onClick={handleGoogleLogin}
                        >
                            Login / Signup
                        </Button>
                        {/* <Button
                            sx={{ 
                                color: "white", 
                                fontSize: { xs: "0.5rem", sm: "0.7rem" }, 
                                borderBottom: "1px solid white", 
                                "&:hover": { 
                                    backgroundColor: "transparent", 
                                    borderBottom: "1px solid darkgreen" 
                                } 
                            }}
                            onClick={handleGoogleLogin}
                        >
                            Signup
                        </Button> */}
                    </>
                )}
            </Box>
        </Box>
    )
}

export default HeaderMenu
