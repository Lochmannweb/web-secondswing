"use client"


import { getSupabaseClient } from '@/app/lib/supabaseClient';
import { Box, Button, Menu, MenuItem, Modal, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

function HeaderMenu() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openLoginModal, setOpenLoginModal] = useState(false)

    const supabase = getSupabaseClient()
    const menuOpen = Boolean(anchorEl)

    // Email + password state
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setIsLoggedIn(!!data.session)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
        })

        return () => listener.subscription.unsubscribe()
    }, [supabase.auth])

    function openLogin() {
        setOpenLoginModal(true)
    }

    function closeLogin() {
        setOpenLoginModal(false)
    }

    async function handleGoogleLogin() {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/shop`,
                queryParams: { prompt: 'select_account' }
            }
        })
    }

    async function handleEmailLogin() {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (!error) closeLogin()
    }

    async function handleEmailSignup() {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (!error) closeLogin()
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
                        onClick={openLogin}
                    >
                        Login / Signup
                    </Button>
                )}
            </Box>
        </Box>

        {/* LOGIN POPUP */}
        <Modal open={openLoginModal} onClose={closeLogin}>
            <Box 
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 320,
                    bgcolor: "#121212",
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                }}
            >
                <Typography variant="h6" textAlign="center">
                    Login / Signup
                </Typography>

                <Button 
                    variant="contained" 
                    onClick={handleGoogleLogin}
                    sx={{ bgcolor: "#4285F4" }}
                >
                    Login med Google
                </Button>

                <Typography textAlign="center">eller</Typography>

                <TextField 
                    label="Email" 
                    variant="outlined" 
                    fullWidth 
                    onChange={(e) => setEmail(e.target.value)}
                    InputLabelProps={{ style: { color: "white" } }}
                    inputProps={{ style: { color: "white" } }}
                />

                <TextField 
                    label="Password" 
                    variant="outlined"
                    type="password"
                    fullWidth
                    onChange={(e) => setPassword(e.target.value)}
                    InputLabelProps={{ style: { color: "white" } }}
                    inputProps={{ style: { color: "white" } }}
                />

                <Button variant="contained" onClick={handleEmailLogin}>
                    Login med email
                </Button>

                <Button variant="outlined" onClick={handleEmailSignup} sx={{ borderColor: "white", color: "white" }}>
                    Opret konto
                </Button>
            </Box>
        </Modal>
        </>
    )
}

export default HeaderMenu
