import { Box, Typography } from '@mui/material'
import React from 'react'

function kontoindstillinger() {
  return (
    <>
        <Box sx={{ color: " black", padding: "1rem" }}>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "3rem" }}>kontoindstillinger</Typography>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>Telefonnummer: </Typography>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>Fulde navn: </Typography>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>Køn: </Typography>
            {/* <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>Fødselsdag: </Typography> */}
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>E-mailadresse: </Typography>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "5rem" }}>Ændre adgangskode: </Typography>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>slet konto: </Typography>
        </Box>
    </>
  )
}

export default kontoindstillinger