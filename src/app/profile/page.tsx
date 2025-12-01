'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, Divider } from '@mui/material'
import Image from 'next/image'


type UserProfile = {
  id: string
  email: string
  display_name: string | null
  phone: string | null
  avatar_url?: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

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
        .select('display_name, phone, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error("Fejl ved hentning af profil:", error.message)
      }

      setProfile({
        id: user.id,
        email: user.email!,
        display_name: user.user_metadata?.display_name ?? null,
        phone: user.user_metadata?.phone ?? null,
        avatar_url: profileData?.avatar_url ?? null,
      })

      setLoading(false)
    }

    fetchProfile()
  }, [router])


  if (loading) return <p>Loading...</p>

  return (
    <>
      <Box sx={{ display: { xs: "grid" }, gridTemplateColumns: { sm: "1fr 1fr" } }}>
        <Box p={2}>
          {profile ? (
            <Box sx={{ width: { xs: "100%", sm: "55%" }, justifySelf: "center", paddingTop: { xs: "5rem" } }}>
                <Image 
                  src={profile.avatar_url || "/placeholderprofile.jpg"}
                  alt="Profilbillede"
                  width={500}
                  height={100}
                  style={{ width: "100%", height: "auto", borderRadius: "1rem" }}
                  />
            </Box>
          ) : (
            <p>Ingen profil fundet</p>
          )}
        </Box>
        
        <Box>
          {profile ? (
            <Box
              sx={{
                backgroundColor: "black",
                top: { xs: "40rem", sm: "30%" },
                padding: "1rem",
                color: "white",
                width: { xs: "100%", sm: "50%" },
                height: { xs: "30vh" },
                position: "absolute",
              }}
            >
              <Box sx={{ display: "grid", gap: "0.5rem" }}>
                <p>{profile.display_name ?? 'Ikke udfyldt'}</p>
                <Divider color="white" sx={{ width: "30%" }} />
              </Box>
              <Box sx={{ paddingTop: "1rem", marginTop: "1rem" }}>
                <Divider />
                <Button sx={{ width: "95%", color: "white", justifyContent: "normal", "&:hover": { backgroundColor: "#00ff001c" } }} href="/opretProdukt">Opret produkt</Button>
                <Divider />
                <Button sx={{ width: "95%", color: "white", justifyContent: "normal", "&:hover": { backgroundColor: "#00ff001c" } }} href="/produkter">Mine Produkter</Button>
                <Divider />
                <Button sx={{ width: "95%", color: "white", justifyContent: "normal","&:hover": { backgroundColor: "#00ff001c" } }} href="indstillinger">Indstillinger</Button>
                <Divider />
                <Button sx={{ width: "95%", color: "white", justifyContent: "normal", "&:hover": { backgroundColor: "#00ff001c" } }} href="/about">Om Second Swing</Button>
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

