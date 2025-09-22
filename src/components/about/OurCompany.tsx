import { Box } from '@mui/material'
import React from 'react'

function OurCompany() {
  return (
    <>   
        <Box sx={{ textAlign: "center" }}>  
                <h1>Our Company</h1>
                <Box sx={{ display: "grid", gap: "1rem" }}>
                    <p>
                        SecondSwing.dk blev startet af Frederik, to passionerede golfspillere, 
                        der ønskede at gøre det lettere og billigere at købe og sælge brugt golfudstyr. 
                    </p> 
                    <p>
                        Vi oplevede selv, hvor dyrt nyt udstyr er, og hvor meget brugt udstyr stadig har at tilbyde. 
                        Derfor skabte vi en platform, hvor golfspillere nemt kan handle direkte med hinanden.
                    </p>
                    <p>
                        Vores mission er at give golfudstyr nyt liv og gøre sporten mere tilgængelig for alle 
                        – mere golf, mindre omkostning!
                    </p>
                </Box>
        </Box>
    </>
  )
}

export default OurCompany