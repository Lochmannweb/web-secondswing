'use client'

import React, { useState } from 'react'
import { Box, Button, Divider, Typography } from '@mui/material'
import { getSupabaseClient } from "@/lib/supabaseClient"
import { useRouter } from 'next/navigation'

function Indstillinger() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    router.push('/') // redirect til homepage
  }

  return (
    <Box sx={{ color: "white" }} p={2} display={{ xs: "grid", sm: "flex" }} justifyContent={{ sm: "center" }} height={{ sm: "100vh" }}>
      <Box pt={"5rem"} alignSelf={{ sm: "center" }} width={{ sm: "50vh" }} height={{ sm: "40vh" }} sx={{ borderRight: { sm: "1px solid gray" } }}>
        <h1>Indstillinger</h1> 
        <Divider sx={{ backgroundColor: "white", mb: 2 }} />

        <Box display={"grid"} width={"100%"}>
          <Button
            href='/indstillinger/profileoplysninger'
            sx={{
              backgroundColor: "transparent",
              color: "white",
              cursor: "pointer",
              display: "flow",
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
              display: "flow",
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
              display: "flow",
              "&:hover": {
                backgroundColor: "#00ff001c",
              }
            }}
          >
            Sikkerhed
            </Button>


          <Button
            onClick={handleLogout}
            sx={{
              backgroundColor: "transparent",
              color: "white",
              cursor: "pointer",
              textAlign: "start",
              width: "100%",
              display: "flow",
              "&:hover": {
                backgroundColor: "#00ff001c",
              }
            }}
          >
            Log ud
          </Button>
      </Box>
      </Box>

      {/* only apper om tablet/desktop else send to a href */}
      <Box width={{ sm: "30vh" }} sx={{ height: "50vh" }} alignSelf={{ sm: "center" }}>
            {/* show content for the specific setting */}
      </Box>

    </Box>
  )
}

export default Indstillinger
