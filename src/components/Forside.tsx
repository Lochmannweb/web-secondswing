"use client"

import React from 'react'
import { Box, Button, Link, Typography } from '@mui/material'
import { supabase } from '@/lib/supabaseClient'

export default function ForsideHero() {
  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/shop`,
        queryParams: { prompt: 'select_account' }, // valgfrit
        skipBrowserRedirect: false, // vigtigt: tvinger redirect i stedet for popup
      }
    })
  }

  return (
    <>
      <Box textAlign={"center"} display={"grid"} color="white">
        <Typography 
          position={"absolute"} 
          top={0} 
          justifySelf={"center"} 
          padding={1}
          textTransform={"uppercase"}
          letterSpacing={3}
          fontSize={"0.8rem"}
          >
            Second Swing
          </Typography>
        {/* image banner */}

        <Box padding={5}>
        <Typography fontSize={"0.5rem"} fontFamily={"auto"} textTransform={"uppercase"} letterSpacing={3}>Tilmeld dig gratis</Typography>
        <Typography fontSize={"1rem"} fontFamily={"auto"} textTransform={"uppercase"} letterSpacing={5} fontWeight={900}>Gør din passion for golf til en oplevelse hver dag.</Typography>
        <Box display={"grid"} gap={2} marginTop={5}>
        <Button
          sx={{
            // backgroundColor: "#e2ffd7",
            backgroundColor: "white",
            color: "black",
            padding: "0.5rem 1.2rem",
            width: "80%",
            justifySelf: "center",
            "&:hover": {
              backgroundColor: "#034100",
              color: "white",
            }
          }}
          onClick={handleGoogleLogin}
        >
          Login
        </Button>
        <Button
          sx={{
            // backgroundColor: "#e2ffd7",
            backgroundColor: "white",
            color: "black",
            padding: "0.5rem 2rem",
            width: "80%",
            justifySelf: "center",
            "&:hover": {
              backgroundColor: "#034100",
              color: "white",
            }
          }}
          onClick={handleGoogleLogin}
        >
          Signup
        </Button>
        </Box>
        </Box>
        <Link 
          position={"absolute"} 
          bottom={0} 
          justifySelf={"center"} 
          padding={1} 
          textTransform={"uppercase"}
          letterSpacing={3}
          fontSize={"0.8rem"}
          style={{ 
            color: "white", 
            textDecorationLine: "none" 
          }} 
          href='/startabout'
          >
            Om Second Swing
          </Link>
      </Box>
    </>
  )
}



    // <Box
    //   sx={{
    //     textAlign: "center",
    //     alignContent: "center",
    //     height: "100vh",
    //     fontFamily: "sans-serif",
    //   }}
    // >
    //   <Typography 
    //     textTransform={"uppercase"}
    //     letterSpacing={{ xs: 6, sm: 8, md: 15, lg: 30 }}
    //     color='white'
    //     fontSize={{ xs: "1.5rem", sm: "2rem", md: "2rem", lg: "4rem" }}
    //   >
    //     Golf med passion
    //   </Typography>
    //   <Typography 
    //     textTransform={"uppercase"}
    //     letterSpacing={6}
    //     color='lightgray'
    //     fontSize={{ xs: "0.5rem", sm: "0.7rem", md: "0.7rem", lg: "1rem" }}
    //   >
    //     brugt udstyr. nye oplevelser.
    //   </Typography>
    //   <Button
    //     sx={{
    //       backgroundColor: "transparent",
    //       color: "white",
    //       padding: "0.1rem 1.2rem",
    //       top: { xs: "2rem", lg: "5rem" },
    //       "&:hover": {
    //         backgroundColor: "white",
    //         color: "black",
    //       }
    //     }}
    //     onClick={handleGoogleLogin}
    //   >
    //     Get started
    //   </Button>
    // </Box>