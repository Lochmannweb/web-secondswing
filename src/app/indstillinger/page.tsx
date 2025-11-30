'use client'

import React, { useState } from 'react'
import { Box, Button, Divider, MenuItem, Typography } from '@mui/material'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

function Indstillinger() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    router.push('/') // redirect til homepage
  }

  return (
    <Box position={"absolute"} top={"5rem"} p={2} sx={{ color: "white" }}>
      <Typography>Indstillinger</Typography> 
      <Divider sx={{ backgroundColor: "white" }} />

      <Box position={"absolute"} top={"5rem"}>
        <Button
          href='/indstillinger/profileoplysninger'
          sx={{
            backgroundColor: "transparent",
            color: "white",
            cursor: "pointer",
            width: "94%",
            justifySelf: "normal",
            alignSelf: "start",
            "&:hover": {
              backgroundColor: "#00ff001c",
            }
          }}
        >
          Profiloplysninger
        </Button>

        <Button
          href='/indstillinger/kontoindstillinger'
          sx={{
            backgroundColor: "transparent",
            color: "white",
            cursor: "pointer",
            width: "94%",
            justifySelf: "normal",
            alignSelf: "start",
            "&:hover": {
              backgroundColor: "#00ff001c",
            }
          }}
        >
          Kontooplysninger
        </Button>

        <Button
          href='/indstillinger/sikkerhed'
          sx={{
            backgroundColor: "transparent",
            color: "white",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#00ff001c",
            }
          }}
        >
          Sikkerhed
        </Button>
      </Box>

      <Box sx={{ marginTop: "12rem" }}>
        <Button
          onClick={handleLogout}
          sx={{
            backgroundColor: "transparent",
            color: "white",
            cursor: "pointer",
            textAlign: "start",
            width: "100%",
            "&:hover": {
              backgroundColor: "#00ff001c",
            }
          }}
        >
          Log ud
        </Button>
      </Box>
    </Box>
  )
}

export default Indstillinger
