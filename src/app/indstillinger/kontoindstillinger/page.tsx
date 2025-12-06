import { Box, Divider, Typography } from '@mui/material'
import React from 'react'

export default function Kontoindstillinger() {
  return (
    <>
        <Box sx={{ color: "white", padding: "1rem" }}>
            <Typography sx={{ borderBottom: "1px solid black"  }}>kontoindstillinger</Typography>
            <Divider color="gray" sx={{ marginBottom: "3rem" }}/>
            
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>Telefonnummer: </Typography>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>Fulde navn: </Typography>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>Køn: </Typography>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>E-mailadresse: </Typography>
        </Box>
    </>
  )
}

