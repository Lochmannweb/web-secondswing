import { Box } from '@mui/material'
import React from 'react'

function OurMission() {
  return (
    <>
        <Box> 
            <h1>Our Team</h1>
            <Box sx={{ display: "grid", gap: "1rem", color: "lightgray" }}>
                <p>
                    Bag SecondSwing.dk står Frederik og Line, to golfentusiaster med en fælles vision 
                    - at gøre det nemmere og billigere at købe og sælge brugt golfudstyr.  
                </p>
                <p>
                    Med erfaring inden for både golf, forretning og digital udvikling har vi skabt en platform, 
                    hvor kvalitet, brugervenlighed og passion for sporten går hånd i hånd.
                </p>
            </Box>
        </Box>
    </>
  )
}

export default OurMission