'use client'

import React, { useState } from 'react'
import { Box, Divider, MenuItem, Typography } from '@mui/material'
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
    <Box sx={{ color: "black" }}>
      <Typography sx={{ padding: "1rem" }}>
        <strong>Indstillinger</strong>
      </Typography>

      <Box sx={{ display: "grid", gap: "1rem" }}>
        <Divider sx={{ backgroundColor: "black" }} />
        <a 
          href='/indstillinger/profiloplysninger'
          style={{ 
            padding: "0rem 1rem 1rem 1rem",
            borderBottom: "1px solid black",
            cursor: "pointer" 
          }}>
            Profiloplysninger
          </a>
        <a 
          href='/indstillinger/kontoindstillinger'
          style={{ 
            padding: "0rem 1rem 1rem 1rem",
            borderBottom: "1px solid black",
            cursor: "pointer" 
          }}>
            Kontooplysninger
          </a>
        <a 
          href='/indstillinger/betalinger'
          style={{ 
            padding: "0rem 1rem 1rem 1rem",
            borderBottom: "1px solid black",
            cursor: "pointer" 
          }}>
            Betalinger
          </a>
        <a 
          href='/indstillinger/sikkerhed'
          style={{ 
            padding: "0rem 1rem 1rem 1rem",
            borderBottom: "1px solid black",
            cursor: "pointer",
          }}>
            Sikkerhed
          </a>
      </Box>

      <Box sx={{ marginTop: "5rem" }}>
          <MenuItem 
            onClick={handleLogout} 
            style={{ 
              padding: "1rem", 
              cursor: "pointer", 
              borderTop: "1px solid black", 
              borderBottom: "1px solid black" 
            }}>
            Log ud
          </MenuItem>
      </Box>
    </Box>
  )
}

export default Indstillinger
