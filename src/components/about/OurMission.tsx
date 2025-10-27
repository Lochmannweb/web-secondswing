import { Box, Typography } from '@mui/material'
import React from 'react'

function OurMission() {
  return (
    <>
        <Box sx={{ textAlign: "center" }}> 
            <Typography variant='h5' fontFamily={"sans-serif"}>Our Mission</Typography>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
                <Typography  fontSize={"0.8rem"}>
                    Vi ønsker at gøre golf mere tilgængeligt for alle. 
                    Nyt golfudstyr kan være dyrt, men der findes masser af gode jern, 
                    køller og bags, der fortjener en ny ejer. 
                </Typography>
                <Typography fontSize={"0.8rem"}>
                    Derfor har vi skabt en simpel, sikker og brugervenlig platform, 
                    hvor golfspillere kan handle med hinanden.
                </Typography>
            </Box>
        </Box>
    </>
  )
}

export default OurMission