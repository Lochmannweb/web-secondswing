"use client"

import { Box, Typography, Button, Stack } from "@mui/material"
import { useRouter } from "next/navigation"
import React from "react"

function Kategorier() {
    const router = useRouter()

    const goToShop = (filter: "all" | "female" | "male") => {
        router.push(`/shop?filter=${filter}`)
    }

    return (
        <Box 
            sx={{ 
                display: { xs: "grid", sm: "none" },
                textAlign: "center", 
                padding: "5rem 3rem 3rem 3rem", 
                paddingBottom: "8rem" ,
                background: "black",
                marginTop: "-1rem"
            }}>
            <Box sx={{ marginBottom: "2rem"}}>
                <Typography 
                    sx={{ 
                        marginBottom: "0px", 
                        fontFamily: "sans-serif", 
                        textTransform: "uppercase",
                        letterSpacing: 7,
                        fontSize: "1.2rem",
                        color: "white"
                    }} 
                    gutterBottom>
                        Golfudstyr til enhver spiller
                </Typography>
                <Typography 
                    sx={{ 
                        marginBottom: "0px", 
                        fontFamily: "sans-serif", 
                        textTransform: "uppercase",
                        letterSpacing: 4,
                        color: "gray",
                        fontSize: "0.7rem"
                    }} 
                    gutterBottom>
                        Find din stil og dit spil
                </Typography>
            </Box>

            <Stack sx={{ display: "grid", gap: "3rem", }}>
                <Box sx={{ position: "relative" }}>
                    <Box 
                        component="img"
                        src={`/golfsætold.jpg`}
                        alt={"golf"}
                        sx={{
                            width: "95%",
                            borderRadius: "1rem",
                            display: "block",
                            margin: "auto",
                            filter: "brightness(0.5)"
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: "100%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                            display: "grid",
                            gap: "1rem",
                            color: "white"
                        }}
                    >
                        <Typography 
                            sx={{ 
                                fontSize: "1.4rem", 
                                marginBottom: "-1rem",
                                textTransform: "uppercase",
                                letterSpacing: 4,
                                fontFamily: "sans-serif"
                            }}>
                                Alle på banen
                        </Typography>
                        <Typography 
                            sx={{ 
                                fontSize: "0.5rem", 
                                textTransform: "uppercase",
                                letterSpacing: 4,
                                fontFamily: "sans-serif",
                                color: "lightgray",
                                px: "1rem"
                            }}>
                                Golfudstyr til ALLE spillere
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ 
                                borderRadius: "1rem", 
                                backgroundColor: "transparent",
                                // border: "1px solid white", 
                                padding: "0.1rem", 
                                width: "30%", 
                                margin: "auto",
                                fontSize: "0.7rem", 
                                "&:hover": {
                                    backgroundColor: "white",
                                    color: "black"
                                }
                            }}
                            onClick={() => goToShop("all")}
                        >
                            See more
                        </Button>
                    </Box>
                </Box>


                <Box sx={{ position: "relative",  }}>
                    <Box 
                        component="img"
                        src={`/golfforfemale.jpg`}
                        alt={"golf"}
                        sx={{
                            width: "95%",
                            borderRadius: "1rem",
                            display: "block",
                            margin: "auto",
                            filter: "brightness(0.5)",
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: "100%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                            color: "white",
                            display: "grid",
                            gap: "1rem"
                        }}
                    >
                        <Typography 
                            sx={{ 
                                fontSize: "1.4rem", 
                                marginBottom: "-1rem",
                                textTransform: "uppercase",
                                letterSpacing: 6,
                                fontFamily: "sans-serif"
                            }}>
                                For hende
                        </Typography>
                        <Typography 
                            sx={{ 
                                fontSize: "0.5rem", 
                                textTransform: "uppercase",
                                letterSpacing: 4,
                                fontFamily: "sans-serif",
                                color: "lightgray",
                                px: 2
                            }}>
                                Stilfuldt & effektivt til kvindelige golfere
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ 
                                borderRadius: "1rem", 
                                backgroundColor: "transparent",
                                // border: "1px solid grey",
                                padding: "0.1rem", 
                                width: "30%", 
                                margin: "auto",
                                fontSize: "0.7rem", 
                                "&:hover": {
                                    backgroundColor: "white",
                                    color: "black"
                                }
                            }}
                            onClick={() => goToShop("female")}
                        >
                            See more
                        </Button>
                    </Box>
                </Box>


                <Box sx={{ position: "relative",  }}>
                    <Box 
                        component="img"
                        src={`/golfformale2.jpg`}
                        alt={"golf"}
                        sx={{
                            width: "95%",
                            borderRadius: "1rem",
                            display: "block",
                            filter: "brightness(0.5)",
                            margin: "auto"
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: "100%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                            color: "white",
                            display: "grid",
                            gap: "1rem"
                        }}
                    >
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontSize: "1.4rem", 
                                marginBottom: "-1rem",
                                textTransform: "uppercase",
                                letterSpacing: 6,
                                fontFamily: "sans-serif"
                            }}>
                                For ham
                        </Typography>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontSize: "0.5rem", 
                                textTransform: "uppercase",
                                letterSpacing: 4,
                                fontFamily: "sans-serif",
                                color: "lightgray",
                                px: 2
                            }}>
                                Performance gear til den dedikerede mand
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ 
                                borderRadius: "2rem", 
                                backgroundColor: "transparent",
                                // border: "1px solid white",
                                padding: "0.1rem", 
                                width: "30%", 
                                margin: "auto",
                                fontSize: "0.7rem", 
                                "&:hover": {
                                    backgroundColor: "white",
                                    color: "black"
                                }
                            }}
                            onClick={() => goToShop("male")}
                        >
                            See more
                        </Button>
                    </Box>
                </Box>
            </Stack>
        </Box>
    )
}

export default Kategorier
