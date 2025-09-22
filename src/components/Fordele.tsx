import { Box, Divider, Typography } from '@mui/material'
import React from 'react'

function Fordele() {
    return (
        <>
            <Box 
                sx={{ 
                    display: { xs: "grid", sm: "none" }, 
                    gap: "2rem", 
                    textAlign: "center",
                    padding: "5rem 1rem 5rem 1rem",
                    textTransform: "uppercase",
                    fontFamily: "sans-serif",
                    background: "black",
                    color: "white",
                    marginTop: { xs: "-8rem" },
                }}>
                <Box>
                    <Typography 
                        fontSize={"0.8rem"} 
                        letterSpacing={4}
                        fontFamily={"sans-serif"}>
                            Topkvalitet til skarpe priser
                    </Typography>
                    <Typography 
                        fontSize={"0.5rem"} 
                        letterSpacing={2}
                        color='gray'
                        fontFamily={"sans-serif"}>
                            spil som en pro uden at tømme pengepungen
                    </Typography>
                </Box>

                <Divider sx={{ justifySelf: "center", width: "60%", backgroundColor: "gray" }} />

                <Box>
                    <Typography 
                        fontSize={"0.8rem"} 
                        letterSpacing={4}
                        fontFamily={"sans-serif"}>
                            Nøje udvalgt brugt udstyr
                    </Typography>
                    <Typography 
                        fontSize={"0.5rem"} 
                        letterSpacing={2}
                        color='gray'
                        fontFamily={"sans-serif"}>
                            klar til nye eventyr på banen
                    </Typography>
                </Box>

                <Divider sx={{ justifySelf: "center", width: "60%", backgroundColor: "gray" }} />
                
                <Box>
                    <Typography 
                        fontSize={"0.8rem"} 
                        letterSpacing={4}
                        fontFamily={"sans-serif"}>
                            Bæredygtigt golfvalg
                    </Typography>
                    <Typography 
                        fontSize={"0.5rem"} 
                        letterSpacing={2}
                        color='gray'
                        fontFamily={"sans-serif"}>
                            spar penge og skån miljøet samtidig
                    </Typography>
                </Box>
            </Box>
        </>
    )
}

export default Fordele