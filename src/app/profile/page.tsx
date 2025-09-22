'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Divider } from '@mui/material'

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
    <Box sx={{ padding: 0 }}>
      {profile ? (
        <>
          <Box>
            <img
              src={profile.avatar_url || "/placeholderprofile.jpg"}
              alt="Profilbillede"
              style={{
                width: "100%",
              }}
            />
          </Box>

          <Box
            sx={{
              backgroundColor: "white",
              padding: "1rem",
              color: "black",
              width: "100%",
              borderTopLeftRadius: "2rem",
              borderTopRightRadius: "2rem",
              // Top: "5rem",
              filter: "drop-shadow(2px 4px 6px black)",
              position: "absolute",
              bottom: "1rem",
              // height: "50vh"
            }}
          >
            <Box sx={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
              <p>{profile.display_name ?? 'Ikke udfyldt'}</p>
            </Box>
            <Box sx={{ padding: "2rem 0", display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
              <Divider />
              <a href="/opretProdukt">Opret produkt</a>
              <Divider />
              <a href="/produkter">Produkter</a>
              <Divider />
              <a href="indstillinger">Indstillinger</a>
              <Divider />
              <a href="/about">Om Second Swing</a>
              <Divider />
            </Box>
          </Box>
        </>
      ) : (
        <p>Ingen profil fundet</p>
      )}
    </Box>
  )
}
