import { Box } from '@mui/material'
import React from 'react'

function WhyUs() {
  return (
    <>
        <Box sx={{ textAlign: "center" }}> 
            <h1>Why Choose us</h1>
            <Box sx={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                <Box>
                    <p><strong>Mere golf, mindre omkostning</strong></p>
                    <p>- Kvalitetsudstyr til en brøkdel af nyprisen</p>
                </Box>
                <Box>
                    <p><strong>Enkel og sikker handel</strong></p>
                    <p>- Vi gør det let at købe og sælge</p>
                </Box>
                <Box>
                    <p><strong>Fællesskab for golfspillere</strong></p>
                    <p>- Skabt af golfere, for golfere</p>
                </Box>
                <Box>
                    <p><strong>Giv dit golfudstyr nyt liv</strong></p>
                    <p>- og find dit næste sæt hos os!</p>
                </Box>
            </Box>
        </Box>
    </>
  )
}

export default WhyUs