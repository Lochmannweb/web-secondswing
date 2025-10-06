'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Box, Typography, useMediaQuery, Drawer, IconButton } from '@mui/material'
import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import HomeFilledIcon from '@mui/icons-material/HomeFilled'
import CommentIcon from '@mui/icons-material/Comment'
import FavoriteIcon from '@mui/icons-material/Favorite'
import PersonIcon from '@mui/icons-material/Person'
import ListIcon from '@mui/icons-material/List'
import CloseIcon from '@mui/icons-material/Close'

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

export default function BasicMenu() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [open, setOpen] = useState(false)

  const theme = useTheme()
  const isTabletUp = useMediaQuery(theme.breakpoints.up('sm'))

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleClose = () => setOpen(false)
  const handleOpenMenu = () => setOpen(true)

  const handleProfile = () => {
    router.push('/profile')
    handleClose()
  }
  const handleChatHistory = () => {
    router.push('/chat')
    handleClose()
  }
  const handleFav = () => {
    router.push('/favoriter')
    handleClose()
  }
  const handleShop = () => {
    router.push('/shop')
    handleClose()
  }

  const handleHome = () => {
    router.push('/')
    handleClose()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: { xs: "space-between", sm: "end" },
        padding: { xs: '0.5rem 1rem' },
        position: { xs: 'fixed', sm: "absolute"},
        alignSelf: { sm: "baseline" },
        bottom: { xs: "0rem" },
        top: { sm: "2rem" },
        backgroundColor: { xs: '#e2ffd7', sm: 'transparent' },
        filter: { xs: "drop-shadow(2px 4px 6px black)", sm: "none" },
        zIndex: 15,
      }}
    >

      {isTabletUp ? (
        <>
          {!open && (
            <ListIcon
              onClick={handleOpenMenu}
              sx={{
                fontSize: "2rem",
                color: 'black',
                cursor: 'pointer'
              }}
            />
          )}

          {/* Drawer that slides from right */}
          <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                width: "20%",
                backgroundColor: "#000000ba",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
              }
            }}
          >
            {/* Close button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={handleClose}>
                <CloseIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>

            {/* Menu items */}
            <Box>
              <Typography
                onClick={handleHome}
                sx={menuItemStyle}
              >
                Home
              </Typography>
              <Typography
                onClick={handleShop}
                sx={menuItemStyle}
              >
                Shop
              </Typography>
              <Typography
                onClick={handleChatHistory}
                sx={menuItemStyle}
              >
                Chat History
              </Typography>
              <Typography
                onClick={handleFav}
                sx={menuItemStyle}
              >
                Favourites
              </Typography>
              {isLoggedIn && (
                <Typography
                  onClick={handleProfile}
                  sx={menuItemStyle}
                >
                  Profile
                </Typography>
              )}
            </Box>
          </Drawer>
        </>
      ) : (
        <>
          {/* <Typography onClick={handleHome} sx={{ color: 'black', cursor: 'pointer', fontWeight: "900" }}>SS</Typography> */}
          <Box display={"grid"} justifyItems={"center"}><HomeOutlinedIcon onClick={handleShop} sx={{ color: 'black', cursor: 'pointer' }} />Home</Box>
          <Box display={"grid"} justifyItems={"center"}><TextsmsOutlinedIcon onClick={handleChatHistory} sx={{ color: 'black', cursor: 'pointer' }} />Chat</Box>
          <Box display={"grid"} justifyItems={"center"}><FavoriteBorderOutlinedIcon onClick={handleFav} sx={{ color: 'black', cursor: 'pointer' }} />Favorites</Box>
          <Box display={"grid"} justifyItems={"center"}>{isLoggedIn && <PersonOutlinedIcon onClick={handleProfile} sx={{ color: 'black', cursor: 'pointer' }} />}Profile</Box>
        </>
      )}
    </Box>
  )
}

// Styles for menu items
const menuItemStyle = {
  color: 'white',
  cursor: 'pointer',
  fontSize: "2rem",
  borderBottom: "1px solid white",
  width: "100%",
  padding: "1rem 0",
}
