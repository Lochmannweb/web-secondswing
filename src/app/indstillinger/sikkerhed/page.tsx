import { Box, Divider, Typography } from '@mui/material'
import React from 'react'

function sikkerhed() {
  return (
    <>
        <Box sx={{ color: " black"}}>
            <Typography 
                sx={{ 
                    padding: "1rem 1rem 0rem 1rem ",
                }}>
                    Beskyt din konto
            </Typography>
            <Divider sx={{ backgroundColor: "grey", width: "50%" }} />
            <p 
                style={{ 
                    marginTop: "0.5rem",
                    marginBottom: "1rem",
                    paddingLeft: "1rem",
                    color: "grey",
                    fontSize: "13px"
                }}>
                    Gennemse dine oplysninger for at beskytte din konto
            </p>

            <Typography 
                sx={{ 
                    padding: "1rem",
                    marginTop: "3rem",
                    borderTop: "1px solid black",
                    borderBottom: "1px solid black"
                }}>
                    E-mail <br />
                    <p style={{ color: "grey", fontSize: "13px" }}>Sørg for, at din e-amil er opdateret</p>
            </Typography>

            <Typography 
                sx={{ 
                    padding: "1rem",
                    borderBottom: "1px solid black"
                }}>
                    Adgangskode <br />
                    <p style={{ color: "grey", fontSize: "13px" }}>Beskyt nye login med en stærkere adgangskode</p>
            </Typography>

            <Typography 
                sx={{ 
                    padding: "1rem",
                    borderBottom: "1px solid black"
                }}>
                    2-trinsverificering <br />
                    <p style={{ color: "grey", fontSize: "13px" }}>Bekræft nye login med 4-cifret kode</p>
            </Typography>

            <Typography 
                sx={{ 
                    padding: "1rem",
                    borderBottom: "1px solid black"
                }}>
                    Loginaktivitet <br />
                    <p style={{ color: "grey", fontSize: "13px" }}>administrer dine enheder som er loggede ind</p>
            </Typography>

        </Box>
    </>
  )
}

export default sikkerhed