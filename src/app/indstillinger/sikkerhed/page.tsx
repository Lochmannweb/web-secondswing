import { Box, Typography } from '@mui/material'
import React from 'react'

export default function Sikkerhed() {
  return (
    <>
        <Box sx={{ color: "white", padding: "1rem", pt: { xs: "8rem", sm: "0" } }}>
            <Typography sx={{ borderBottom: "1px solid gray" }}>Sikkerhed</Typography>

            <Box sx={{ mt: 2, padding: "1rem", backgroundColor: "#121212ff", borderRadius: "0.3rem"}}>
                <Typography>Adgangskode: <span style={{ color: "grey", fontSize: "13px" }}>Beskyt nye login med en stærkere adgangskode</span></Typography>
                <Typography>2-trinsverificering: <span style={{ color: "grey", fontSize: "13px" }}>Bekræft nye login med 4-cifret kode</span></Typography>
                <Typography>Loginaktivitet: <span style={{ color: "grey", fontSize: "13px" }}>administrer dine enheder som er loggede ind</span></Typography>
            </Box>
        </Box>

    </>
  )
}

 