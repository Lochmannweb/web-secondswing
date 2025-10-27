import { Box, Typography } from '@mui/material'
import React from 'react'

function WhyUs() {
  return (
    <>
        <Box sx={{ textAlign: "center" }}> 
            <Typography>Why Choose us</Typography>
            <Box sx={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                <Box>
                    <Typography><strong>Mere golf, mindre omkostning</strong></Typography>
                    <Typography>- Kvalitetsudstyr til en brøkdel af nyprisen</Typography>
                </Box>
                <Box>
                    <Typography><strong>Enkel og sikker handel</strong></Typography>
                    <Typography>- Vi gør det let at købe og sælge</Typography>
                </Box>
                <Box>
                    <Typography><strong>Fællesskab for golfspillere</strong></Typography>
                    <Typography>- Skabt af golfere, for golfere</Typography>
                </Box>
                <Box>
                    <Typography><strong>Giv dit golfudstyr nyt liv</strong></Typography>
                    <Typography>- og find dit næste sæt hos os!</Typography>
                </Box>
            </Box>
        </Box>
    </>
  )
}

export default WhyUs