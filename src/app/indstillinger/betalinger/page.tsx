import { Box, Typography } from '@mui/material'
import React from 'react'

function betalinger() {
  return (
    <>
        <Box sx={{ color: " black", padding: "1rem" }}>
            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>Betalingsmuligheder</Typography>
            <Typography sx={{ marginBottom: "3rem" }}>Tilføj kort</Typography>

            <Typography sx={{ borderBottom: "1px solid black", marginBottom: "1rem" }}>Udbetalingsmuligheder</Typography>
            <Typography>Tilføj bankkonto</Typography>
        </Box>
    </>
  )
}

export default betalinger