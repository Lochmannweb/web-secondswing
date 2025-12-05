'use client'

import { getSupabaseClient } from '@/app/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, Divider } from '@mui/material'
import Image from 'next/image'


type UserProfile = {
  id: string
  email: string
  avatar_url?: string | null
  display_name: string | null
  // phone: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  console.log("profile: ", profile);
  

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // hent avatar_url fra profiles-tabellen
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error("Fejl ved hentning af profil:", error.message)
      }

      setProfile({
        id: user.id,
        email: user.email!,
        display_name: profileData?.display_name ?? null,
        // phone: user.user_metadata?.phone ?? null,
        avatar_url: profileData?.avatar_url ?? null,
      })

      setLoading(false)
    }

    fetchProfile()
  }, [router, supabase])


  // opdater kvalitet på google profil billede, da googles opløsning af billeder er ekstrem lort
  function upgradeGoogleAvatar(url: string) {
    return url.replace(/=s\d+-c$/, "=s512-c");
  }


  if (loading) return <p>Loading...</p>

  return (
    <>
      <Box sx={{ display: { xs: "grid", sm: "flex" }, justifyContent: { sm: "center" }, height: { sm: "100vh" }, gap: { sm: "5rem" }, pt: { xs: "5rem" } }} p={2}>
        <Box alignSelf={{ sm: "center" }}>
          {profile ? (
            <Box>
                <Image 
                  src={upgradeGoogleAvatar(profile.avatar_url || "/placeholderprofile.jpg")}
                  alt="Profilbillede"
                  width={800}
                  height={100}
                  style={{ width: "100%", height: "auto", borderRadius: "1rem" }}
                  />
            </Box>
          ) : (
            <p>Ingen profil fundet</p>
          )}
        </Box>
        
        <Box alignSelf={{ sm: "center" }} width={{ sm: "15%" }}>
          {profile ? (
            <Box
              sx={{
                backgroundColor: "black",
                padding: "1rem",
                color: "white",
                position: "absolute",
                alignSelf: { sm: "center" }
                
              }}
            >
              <Box sx={{ display: "grid", gap: "0.5rem" }}>
                <p>{profile.display_name ?? 'Ikke udfyldt'}</p>
                <Divider color="white"/>
              </Box>
              <Box sx={{ paddingTop: "1rem", marginTop: "1rem" }}>
                <Divider />
                <Button sx={{width: { xs: "48vh", sm: "50vh" }, color: "white", justifyContent: "normal", "&:hover": { backgroundColor: "#00ff001c" } }} href="/indstillinger/profiloplysninger">Rediger Profil</Button>
                <Divider />
                <Button sx={{width: { xs: "48vh", sm: "50vh" }, color: "white", justifyContent: "normal", "&:hover": { backgroundColor: "#00ff001c" } }} href="/opretProdukt">Opret produkt</Button>
                <Divider />
                <Button sx={{width: { xs: "48vh", sm: "50vh" }, color: "white", justifyContent: "normal", "&:hover": { backgroundColor: "#00ff001c" } }} href="/produkter">Mine Produkter</Button>
                <Divider />
                <Button sx={{width: { xs: "48vh", sm: "50vh" }, color: "white", justifyContent: "normal","&:hover": { backgroundColor: "#00ff001c" } }} href="indstillinger">Indstillinger</Button>
                <Divider />
                <Button sx={{width: { xs: "48vh", sm: "50vh" }, color: "white", justifyContent: "normal", "&:hover": { backgroundColor: "#00ff001c" } }} href="/about">Om Second Swing</Button>
                <Divider />
              </Box>
            </Box>
          ) : (
            <p>Ingen profil fundet</p>
          )}
        </Box>
      </Box>

    </>
  )
}

