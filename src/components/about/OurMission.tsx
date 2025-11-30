import { Box } from '@mui/material'
import React from 'react'

function OurMission() {
  return (
    <>
        <Box> 
            <h1>Our Mission</h1>
            <Box sx={{ display: "grid", gap: "1rem", color: "lightgray" }}>
                <p>
                    Vi ønsker at gøre golf mere tilgængeligt for alle. 
                    Nyt golfudstyr kan være dyrt, men der findes masser af gode jern, 
                    køller og bags, der fortjener en ny ejer. 
                </p>
                <p>
                    Derfor har vi skabt en simpel, sikker og brugervenlig platform, 
                    hvor golfspillere kan handle med hinanden.
                </p>
            </Box>
        </Box>
    </>
  )
}

export default OurMission