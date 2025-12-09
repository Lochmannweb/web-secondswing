// er ikke blevet kodet færdig endnu
import { Box, Typography } from '@mui/material'
import React from 'react'

export default function Kontoindstillinger() {

    // useEffect(() => {
    //   const fetchProfile = async () => {
    //     const { data: { user } } = await supabase.auth.getUser()
  
  
    //     // BRUGER IKKE LOGGET IND → VIS LOGIN POPUP
    //     if (!user) {
    //       setNeedsLogin(true)
    //       setLoading(true)
    //       return
    //     }
  
    //     // Hent profil fra DB
    //     const { data: profileData } = await supabase
    //       .from('profiles')
    //       .select('display_name, avatar_url')
    //       .eq('id', user.id)
    //       .single()
  
    //     setProfile({
    //       id: user.id,
    //       email: user.email!,
    //       display_name: profileData?.display_name ?? null,
    //       // phone: user.user_metadata?.phone ?? null,
    //       avatar_url: profileData?.avatar_url ?? null,
    //     })
  
    //     setLoading(false)
    //   }
  
    //   fetchProfile()
  
    //   // Lyt efter logins/logouts
    //   const { data: listener } = supabase.auth.onAuthStateChange(() => {
    //     fetchProfile()
    //   })
  
  
    //   return () => { listener?.subscription.unsubscribe() }
    // }, [router, supabase])

  return (
    <>
        <Box sx={{ color: "white", pt: { xs: "8rem", sm: "0rem" }, mt: {sm: "-1.5rem"}, p: 2 }}>
            <Typography sx={{ borderBottom: "1px solid gray" }}>Kontooplysninger</Typography>
            
            <Box sx={{ mt: 2, padding: "1rem", backgroundColor: "#121212ff", borderRadius: "0.3rem"}}>
              <Typography>Telefonnummer: </Typography>
              <Typography>Fulde navn: </Typography>
              <Typography>Køn: </Typography>
              <Typography>E-mailadresse: </Typography>
            </Box>
        </Box>
    </>
  )
}

