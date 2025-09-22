"use client"

import React from 'react'
import { Box, Button, Typography } from '@mui/material'


export default function ForsideHero() {
    
    return (
        <>
            <Box
                sx={{
                    textAlign: "center",
                    alignContent: "center",
                    height: "100vh",
                    fontFamily: "sans-serif",
                }}
            >
                <Typography 
                  fontFamily={"sans-serif"}
                  textTransform={"uppercase"}
                  letterSpacing={{ xs: 6, sm: 8, md: 15, lg: 30 }}
                  color='white'
                  fontSize={{ xs: "1.5rem", sm: "2rem", md: "2rem", lg: "4rem" }}
                  >
                    Golf med passion
                </Typography>
                <Typography 
                  fontFamily={"sans-serif"}
                  textTransform={"uppercase"}
                  letterSpacing={6}
                  color='lightgray'
                  fontSize={{ xs: "0.5rem", sm: "0.7rem", md: "0.7rem", lg: "1rem" }}
                  >
                    brugt udstyr. nye oplevelser.
                </Typography>
                <Button
                    sx={{
                        backgroundColor: "transparent",
                        color: "white",
                        padding: "0.1rem 1.2rem",
                        top: { xs: "2rem", lg: "5rem" },
                        fontFamily: "sans-serif",
                        "&:hover": {
                          backgroundColor: "white",
                          color: "black",
                        }
                    }}
                    href="/auth/signup">Get started</Button>
            </Box>
    </>
  )
};