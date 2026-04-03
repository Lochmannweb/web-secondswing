'use client'

import { getSupabaseClient } from '@/app/lib/supabaseClient'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge, Box, Button } from '@mui/material'
import Image from 'next/image'
import Profiloplysninger from '../indstillinger/profiloplysninger/page'
import OpretProdukt from '../components/Products/OpretProdukt'
import Favoriter from '../favoriter/page'
import PrivatlivPage from '../indstillinger/privatliv/page'
import FaqPage from '../faq/page'
import '../profile.css'
import '../profil.css'


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
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const supabase = useMemo(() => getSupabaseClient(), [])

  const [activeSection, setActiveSection] = useState<string>("editProfile")
  const isMobile = typeof window !== "undefined" && window.innerWidth < 599
  const menuItems = [
    { key: 'fav', label: 'Favoriter', link: '/favoriter' },
    { key: 'messages', label: 'Beskeder', link: '/chats' },
    { key: 'myProducts', label: 'Mine produkter', link: '/produkter' },
    { key: 'createProduct', label: 'Sælg nyt udstyr', link: '/opretProdukt' },
    { key: 'editProfile', label: 'Rediger profil', link: '/indstillinger/profiloplysninger' },
    { key: 'privacy', label: 'Indstillinger', link: '/indstillinger/privatliv' },
  ] as const

  useEffect(() => {
    const section = searchParams.get("section")
    const allowedSections = ["editProfile", "createProduct", "fav", "privacy", "faq"]

    if (section && allowedSections.includes(section)) {
      setActiveSection(section)
    }
  }, [searchParams])

  useEffect(() => {
    let isMounted = true

    const loadUnreadCount = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const currentUserId = userData.user?.id

      if (!currentUserId) {
        if (isMounted) {
          setUnreadMessageCount(0)
        }
        return
      }

      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", currentUserId)
        .is("read_at", null)

      if (isMounted) {
        setUnreadMessageCount(count ?? 0)
      }
    }

    loadUnreadCount()

    const syncUnreadCount = async () => {
      await loadUnreadCount()
    }

    const channelPromise = supabase.auth.getUser().then(({ data }) => {
      const currentUserId = data.user?.id
      if (!currentUserId) {
        return null
      }

      return supabase
        .channel(`profile-unread-${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${currentUserId}`,
          },
          syncUnreadCount
        )
        .subscribe()
    })

    return () => {
      isMounted = false
      channelPromise.then((channel) => {
        if (channel) {
          supabase.removeChannel(channel)
        }
      })
    }
  }, [supabase])


  // funktion der skifter mellem indhold eller links
  const handleNavigation = (target: string, link: string) => {
    if (target === "createProduct" || target === "myProducts" || target === "fav" || target === "messages") {
      router.push(link)
      return
    }

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
      <Box className="profile-login-gate">
        <h2 className="profile-login-title">Du skal logge ind for at se profilen</h2>
        <Button 
          variant="contained"
          onClick={signInWithGoogle}
          className="profile-login-button"
        >
          Log ind med Google
        </Button>
      </Box>
    )
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
                <Box className="profile-identity-copy">
                  <p className="profile-kicker">Profil</p>
                  <h2 className="profile-name">{profile.display_name ?? 'Ikke udfyldt'}</h2>
                  <p className="profile-email">{profile.email}</p>
                </Box>
              </Box>

              <Box className="profile-menu-group">
                {menuItems.map((item) => (
                  <Button
                    key={item.key}
                    className={`profile-action-button${activeSection === item.key ? ' is-active' : ''}`}
                    onClick={() => handleNavigation(item.key, item.link)}
                  >
                    {String(item.key) === "messages" ? (
                      <Badge
                        color="error"
                        badgeContent={unreadMessageCount}
                        max={99}
                        invisible={unreadMessageCount === 0}
                      >
                        {item.label}
                      </Badge>
                    ) : item.label}
                  </Button>
                ))}

                {/* 

                <Button
                  className="profile-action-button"
                  onClick={() => handleNavigation("faq", "/faq")}
                >
                  FAQ
                </Button> */}

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

              {/* <Box className="profile-logout-group">
                <Button 
                  className="profile-action-button"
                    onClick={handleLogout}
                    >
                      Log ud
                </Button>
              </Box> */}
            </Box>
          ) : (
            <p>Ingen profil fundet</p>
          )}
        </Box>

      <Box className="profile-content">
        <Box className="profile-content-shell">
            {/* {activeSection === "profil" && <p>Vælg noget fra menuen.</p>} */}
            {activeSection === "editProfile" && <Profiloplysninger />}
            {activeSection === "createProduct" && <OpretProdukt />}
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

