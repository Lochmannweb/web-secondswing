'use client'

import { getSupabaseClient } from '@/app/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Button, Divider } from '@mui/material'
import Image from 'next/image'
import Profiloplysninger from '../indstillinger/profiloplysninger/page'
import OpretProdukt from '../components/Products/OpretProdukt'
import ProdukterPage from '../produkter/page'
import Favoriter from '../favoriter/page'
import PrivatlivPage from '../indstillinger/privatliv/page'
import FaqPage from '../faq/page'


type UserProfile = {
  id: string
  email: string
  avatar_url?: string | null
  display_name: string | null
  // phone: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsLogin, setNeedsLogin] = useState(false)
  const supabase = getSupabaseClient()  
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [activeSection, setActiveSection] = useState<string>("fav")
  const isMobile = typeof window !== "undefined" && window.innerWidth < 599

  useEffect(() => {
    const section = searchParams.get("section")
    const allowedSections = ["editProfile", "createProduct", "myProducts", "fav", "privacy", "faq"]

    if (section && allowedSections.includes(section)) {
      setActiveSection(section)
    }
  }, [searchParams])


  // funktion der skifter mellem indhold eller links
  const handleNavigation = (target: string, link: string) => {
    if(isMobile) {
      router.push(link)
    } else {
      setActiveSection(target)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()


      // BRUGER IKKE LOGGET IND → VIS LOGIN POPUP
      if (!user) {
        setNeedsLogin(true)
        setLoading(true)
        return
      }

      // Hent profil fra DB
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single()

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

    // Lyt efter logins/logouts
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })


    return () => { listener?.subscription.unsubscribe() }
  }, [router, supabase])

  function signInWithGoogle() {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
        queryParams: { prompt: "select_account" },
      },
    })
  }


  // opdater kvalitet på google profil billede, da googles opløsning af billeder er ekstrem lort
  function upgradeGoogleAvatar(url: string) {
    return url.replace(/=s\d+-c$/, "=s512-c");
  }


    // ⬇️ Viser login-popup i stedet for redirect
  if (needsLogin) {
    return (
      <Box p={3}>
        <h2>Du skal logge ind for at se profilen</h2>
        <Button 
          variant="contained"
          onClick={signInWithGoogle}
          sx={{ mt: 2 }}
        >
          Log ind med Google
        </Button>
      </Box>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    router.push('/') // redirect til homepage
  }


  if (loading) return <p>Loading...</p>

  return (
    <>
      <Box className="profile-layout">
        <Box className="profile-sidebar">
          {profile ? (
            <Box className={"profile-box"} >
              <Box className="profile-container">
                <Image 
                  src={upgradeGoogleAvatar(profile.avatar_url || "/placeholderprofile.jpg")}
                  alt="Profilbillede"
                  width={800}
                  height={100}
                  className="profile-avatar"
                  priority
                  />
                <h2 className="profile-name">{profile.display_name ?? 'Ikke udfyldt'}</h2>
              </Box>
              <Divider color="gray"/>

              <Box className="profile-menu-group">
                <Button 
                  className="profile-action-button"
                  onClick={() => handleNavigation("editProfile", "/indstillinger/profiloplysninger")}
                  >
                    Rediger Profil
                </Button>


                <Button 
                  className="profile-action-button"
                    onClick={() => handleNavigation("createProduct", "/opretProdukt")}
                    >
                      Sælg udstyr
                </Button>


                <Button 
                  className="profile-action-button"
                    onClick={() => handleNavigation("myProducts", "/produkter")}
                    >
                      Alle Produkter
                </Button>

                <Button 
                  className="profile-action-button"
                    onClick={() => handleNavigation("fav", "/favoriter")}
                    >
                      Favoriter
                </Button>

                <Button
                  className="profile-action-button"
                  onClick={() => handleNavigation("privacy", "/indstillinger/privatliv")}
                >
                  Privatliv og cookies
                </Button>

                <Button
                  className="profile-action-button"
                  onClick={() => handleNavigation("faq", "/faq")}
                >
                  FAQ
                </Button>

                {/* <Button 
                  sx={{
                    width: "100%",
                    color: "white", 
                    justifyContent: "normal", 
                    "&:hover": { 
                      backgroundColor: "#0b0b0bc3"
                      } 
                    }} 
                    onClick={() => handleNavigation("Kontooplysninger", "/indstillinger/kontoindstillinger")}
                    >
                      Kontooplysninger
                </Button> */}
              </Box>

              <Box className="profile-logout-group">
                <Button 
                  className="profile-action-button"
                    onClick={handleLogout}
                    >
                      Log ud
                </Button>
              </Box>
            </Box>
          ) : (
            <p>Ingen profil fundet</p>
          )}
        </Box>

      <Box className="profile-content">
        <Box>
            {/* {activeSection === "profil" && <p>Vælg noget fra menuen.</p>} */}
            {activeSection === "editProfile" && <Profiloplysninger />}
            {activeSection === "createProduct" && <OpretProdukt />}
            {activeSection === "myProducts" && <ProdukterPage />}
            {activeSection === "fav" && <Favoriter />}
            {activeSection === "privacy" && <PrivatlivPage />}
            {activeSection === "faq" && <FaqPage />}
            {/* {activeSection === "Kontooplysninger" && <Kontoindstillinger />} */}
            {/* {activeSection === "sikkerhed" && <Sikkerhed />} */}
        </Box>
      </Box>
      </Box>
    </>
  )
}

