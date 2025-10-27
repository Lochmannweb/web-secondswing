import { Box, Typography } from '@mui/material'
import React from 'react'

function OurCompany() {
  return (
    <>   
        <Box sx={{ textAlign: "center" }}>  
                <Typography variant='h5' fontFamily={"sans-serif"}>Our Company</Typography>
                <Box display={"flex"} flexDirection={"column"} gap={2}>
                    <Typography fontSize={"0.8rem"}>
                        SecondSwing.dk blev startet af Frederik, to passionerede golfspillere, 
                        der ønskede at gøre det lettere og billigere at købe og sælge brugt golfudstyr. 
                    </Typography> 
                    <Typography fontSize={"0.8rem"}>
                        Vi oplevede selv, hvor dyrt nyt udstyr er, og hvor meget brugt udstyr stadig har at tilbyde. 
                        Derfor skabte vi en platform, hvor golfspillere nemt kan handle direkte med hinanden.
                    </Typography>
                    <Typography fontSize={"0.8rem"}>
                        Vores mission er at give golfudstyr nyt liv og gøre sporten mere tilgængelig for alle 
                        – mere golf, mindre omkostning!
                    </Typography>
                </Box>
        </Box>
    </>
  )
}

export default OurCompany