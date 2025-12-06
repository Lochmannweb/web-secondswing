"use client"


import { getSupabaseClient } from '@/app/lib/supabaseClient';
import { Box, Button, Menu, MenuItem } from '@mui/material'
import React, { useEffect, useState } from 'react'

function HeaderMenu() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const supabase = getSupabaseClient()
    const menuOpen = Boolean(anchorEl)

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
                        fontSize: { xs: "0.5rem", sm: "0.7rem" }, 
                        "&:hover": { 
                            backgroundColor: "transparent", 
                            borderBottom: "1px solid darkgreen" 
                        } 
                    }}
                >Second Swing</Button>
            </Box>

            <Box sx={{ display: "flex", gap: "1rem" }}>
                <Button href="/about" sx={{ color: "white", borderBottom: "1px solid white" }}>About</Button>
                <Button href="/shop" sx={{ color: "white", borderBottom: "1px solid white" }}>Shop</Button>
            </Box>

            <Box sx={{ display: "flex", gap: "1rem" }}>
                {isLoggedIn ? (
                    <>
                        <Button
                            onClick={handleProfileClick}
                            sx={{ color: "white", borderBottom: "1px solid white" }}
                        >
                            Profile
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleProfileClose}
                            MenuListProps={{ sx: { backgroundColor: "#0f0f0fff", color: "white" } }}
                        >
                            <MenuItem component="a" href="/profile">Se profil</MenuItem>
                            <MenuItem component="a" href="/indstillinger/profiloplysninger">Rediger profil</MenuItem>
                            <MenuItem component="a" href="/produkter">Mine produkter</MenuItem>
                            <MenuItem component="a" href="/favoriter">Favoritter</MenuItem>
                            <MenuItem component="a" href="/chat">Chat historik</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Button
                        sx={{ color: "white", borderBottom: "1px solid white" }}
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
