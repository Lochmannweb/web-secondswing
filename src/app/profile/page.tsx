'use client'

import { getSupabaseClient } from '@/app/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, Divider } from '@mui/material'
import Image from 'next/image'
import Profiloplysninger from '../indstillinger/profiloplysninger/page'
import OpretProdukt from '../components/Products/OpretProdukt'
import ProdukterPage from '../produkter/page'
import Kontoindstillinger from '../indstillinger/kontoindstillinger/page'
import Sikkerhed from '../indstillinger/sikkerhed/page'


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
  const [needsLogin, setNeedsLogin] = useState(false)
  const supabase = getSupabaseClient()  
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [activeSection, setActiveSection] = useState<string>("profil")
  const isMobile = typeof window !== "undefined" && window.innerWidth < 599


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
      <Box sx={{ display: { xs: "grid", sm: "flex" }, justifyContent: { sm: "center" }, height: { sm: "100vh" }, gap: { sm: "5rem" }, pt: { xs: "5rem" } }} p={2}>
        <Box alignSelf={{ sm: "center" }} width={{ sm: "20%" }}>
          {profile ? (
            <Box
              sx={{
                color: "white",
              }}
            >
              <Box sx={{ display: "flex", gap: "3rem", mb: 2 }}>
                <Image 
                  src={upgradeGoogleAvatar(profile.avatar_url || "/placeholderprofile.jpg")}
                  alt="Profilbillede"
                  width={800}
                  height={100}
                  style={{ width: "20%", height: "auto", borderRadius: "50%" }}
                  priority
                  />
                <h2 style={{ textTransform: "uppercase", alignSelf: "center" }}>{profile.display_name ?? 'Ikke udfyldt'}</h2>
              </Box>
              <Divider color="gray"/>

              <Box sx={{ paddingTop: "1rem", marginTop: "1rem" }}>
                <Button 
                  sx={{
                    width: { xs: "48vh", sm: "50vh" }, 
                    color: "white", 
                    justifyContent: "normal", 
                    "&:hover": { 
                      backgroundColor: "#00ff001c" 
                    } 
                  }} 
                  onClick={() => handleNavigation("editProfile", "/indstillinger/profiloplysninger")}
                  >
                    Profiloplysninger
                </Button>


                <Button 
                  sx={{
                    width: { xs: "48vh", sm: "50vh" }, 
                    color: "white", 
                    justifyContent: "normal", 
                    "&:hover": { 
                      backgroundColor: "#00ff001c" 
                      } 
                    }} 
                    onClick={() => handleNavigation("createProduct", "/opretProdukt")}
                    >
                      Opret produkt
                </Button>


                <Button 
                  sx={{
                    width: { xs: "48vh", sm: "50vh" }, 
                    color: "white", 
                    justifyContent: "normal", 
                    "&:hover": { 
                      backgroundColor: "#00ff001c" 
                      } 
                    }} 
                    onClick={() => handleNavigation("myProducts", "/produkter")}
                    >
                      Mine Produkter
                </Button>

                <Button 
                  sx={{
                    width: { xs: "48vh", sm: "50vh" }, 
                    color: "white", 
                    justifyContent: "normal", 
                    "&:hover": { 
                      backgroundColor: "#00ff001c" 
                      } 
                    }} 
                    onClick={() => handleNavigation("Kontooplysninger", "/indstillinger/Kontooplysninger")}
                    >
                      Kontooplysninger
                </Button>

                <Button 
                  sx={{
                    width: { xs: "48vh", sm: "50vh" }, 
                    color: "white", 
                    justifyContent: "normal", 
                    "&:hover": { 
                      backgroundColor: "#00ff001c" 
                      } 
                    }} 
                    onClick={() => handleNavigation("sikkerhed", "/indstillinger/sikkerhed")}
                    >
                      Sikkerhed
                </Button>

                <Button 
                  sx={{
                    width: { xs: "48vh", sm: "50vh" }, 
                    color: "white", 
                    justifyContent: "normal", 
                    "&:hover": { 
                      backgroundColor: "#00ff001c" 
                      } 
                    }} 
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

        {/* vi indhold udfra den setting der bliver valgt */}
        <Box width={"40%"} color={"white"} alignSelf={{ sm: "center" }}>
            {/* {activeSection === "profil" && <p>Vælg noget fra menuen.</p>} */}
            {activeSection === "editProfile" && <Profiloplysninger />}
            {activeSection === "createProduct" && <OpretProdukt />}
            {activeSection === "myProducts" && <ProdukterPage />}
            {activeSection === "Kontooplysninger" && <Kontoindstillinger />}
            {activeSection === "sikkerhed" && <Sikkerhed />}
        </Box>
      </Box>
    </>
  )
}

