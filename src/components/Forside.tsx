"use client"

import React from 'react'
import { Box, Button, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/navigation'
import "@/app/font.module.css";


export default function ForsideHero() {
    const theme = useTheme()
    const isDesktop = useMediaQuery(theme.breakpoints.up("sm"))

    const router = useRouter()

    const goToShop = (filter: "all" | "female") => {
        router.push(`/shop?filter=${filter}`)
    }
    
    return (
        <>
        {/* Mobil version */}
        {!isDesktop && (
            <Box
                sx={{
                    textAlign: "center",
                    alignContent: "center",
                    height: "100vh",
                    fontFamily: "sans-serif",
                    background: { xs: "linear-gradient(0deg, black, transparent)" }
                }}
            >
                <Typography 
                  fontFamily={"sans-serif"}
                  textTransform={"uppercase"}
                  letterSpacing={6}
                  fontSize={{ xs: "1.5rem", sm: "1rem", md: "4rem" }}
                  >
                    Golf med passion
                </Typography>
                <Typography 
                  fontFamily={"sans-serif"}
                  textTransform={"uppercase"}
                  letterSpacing={6}
                  color='lightgray'
                  fontSize={{ xs: "0.5rem", sm: "1rem", md: "4rem" }}
                  >
                    brugt udstyr. nye oplevelser.
                </Typography>
                <Button
                    sx={{
                        backgroundColor: "transparent",
                        color: "white",
                        padding: "0.1rem 1.2rem",
                        top: "2rem",
                        fontFamily: "sans-serif",
                        "&:hover": {
                          backgroundColor: "white",
                          color: "black",
                        }
                    }}
                    href="/auth/signup">Get started</Button>
            </Box>
        )} 

        {/* tablet / desktop version */}
            {isDesktop && (
              <Box sx={{ display: "flex", alignItems: "center", height: "100vh", px: "6rem" }}>
                <Box>
                  <Typography 
                    // textTransform={"uppercase"}
                    fontFamily={"sans-serif"}
                    letterSpacing={10}
                    fontSize={{ xs: "1rem", sm: "1rem", md: "4rem" }}
                    >
                    Golf med passion
                  </Typography>
                  <p>- brugt udstyr, nye oplevelser</p>
                  <Button
                    sx={{
                      backgroundColor: "white",
                      color: "black",
                      padding: "0.1rem 1.2rem",
                      mt: "1rem",
                    }}
                    href="/auth/signup"
                  >
                    Start nu
                  </Button>
                </Box>
                
                {/* Right side overlapping cards */}
                <Box sx={{ flex: 1, position: "relative" }}>  
                  {/* Big card */}
                  {/* <Box sx={{ position: "relative", width: "60%", margin: "0 auto" }}>
                    <img
                      src="/golfsætold.jpg"
                      alt="golf"
                      style={{
                        width: "70%",
                        borderRadius: "1rem",
                        display: "block",
                        // filter: "brightness(0.6)",
                        filter: "drop-shadow(2px 4px 6px black)"
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "35%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        color: "white",
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", mb: 1 }}>
                        Alle på banen
                      </Typography>
                      <p style={{ fontSize: "12px" }}>- Golfudstyr til ALLE spillere</p>
                      <Button
                        variant="contained"
                        sx={{
                          borderRadius: "2rem",
                          backgroundColor: "transparent",
                          border: "1px solid grey",
                          padding: "0.1rem",
                          width: "70%",
                          fontSize: "0.7rem",
                          "&:hover": {
                            backgroundColor: "white",
                            color: "black",
                          },
                        }}
                        onClick={() => goToShop("all")}
                      >
                        See more
                      </Button>
                    </Box>
                  </Box> */}
                    
                  {/* Small card (overlapping bottom-right) */}
                  {/* <Box
                    sx={{
                      position: "absolute",
                      bottom: "-7rem",
                      right: "8rem",
                      width: "40%",
                    }}
                  >
                    <img
                      src="/golfforfemale.jpg"
                      alt="golf"
                      style={{
                        width: "80%",
                        borderRadius: "1rem",
                        display: "block",
                        // filter: "brightness(0.6)",
                        filter: "drop-shadow(2px 4px 6px black)"
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "40%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        color: "white",
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem", mb: 1 }}>
                        For hende
                      </Typography>
                      <p style={{ fontSize: "12px" }}>- Stilfuldt & effektivt til kvindelige golfere</p>
                      <Button
                        variant="contained"
                        sx={{
                          borderRadius: "2rem",
                          backgroundColor: "transparent",
                          border: "1px solid grey",
                          padding: "0.1rem",
                          width: "70%",
                          fontSize: "0.7rem",
                          "&:hover": {
                            backgroundColor: "white",
                            color: "black",
                          },
                        }}
                        onClick={() => goToShop("female")}
                      >
                        See more
                      </Button>
                    </Box>
                  </Box> */}
                </Box>
              </Box>
            )}
        </>
    )
};