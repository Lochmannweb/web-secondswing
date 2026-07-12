"use client";

import { useNotifications } from "@/app/hooks/useNotifications";
import { getProfile } from "@/app/lib/profilesApi";
import { getUnreadMessageCount } from "@/app/lib/chatsApi";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Box, Button } from "@mui/material";
import Image from "next/image";
import "../profile.css";

type UserProfile = {
  id: string;
  email: string;
  avatar_url?: string | null;
  display_name: string | null;
};

const menuItems = [
  { key: "messages", label: "Beskeder", link: "/chats" },
  { key: "notifications", label: "Notifikationer", link: "/notifikationer" },
  { key: "fav", label: "Favoritter", link: "/favoriter" },
  { key: "myProducts", label: "Mine produkter", link: "/produkter" },
  { key: "createProduct", label: "Sælg nyt udstyr", link: "/opretProdukt" },
  { key: "settings", label: "Indstillinger", link: "/indstillinger" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const { unreadCount: unreadNotificationCount } = useNotifications();
  const supabase = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    let isMounted = true;

    const loadUnreadCount = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      if (!currentUserId) {
        if (isMounted) setUnreadMessageCount(0);
        return;
      }

      try {
        const count = await getUnreadMessageCount(currentUserId);
        if (isMounted) setUnreadMessageCount(count);
      } catch {
        if (isMounted) setUnreadMessageCount(0);
      }
    };

    loadUnreadCount();
    const intervalId = window.setInterval(loadUnreadCount, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [supabase]);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNeedsLogin(true);
        setLoading(false);
        return;
      }

      let profileData = null;
      try {
        profileData = await getProfile(user.id);
      } catch {
        profileData = null;
      }

      setProfile({
        id: user.id,
        email: user.email!,
        display_name: profileData?.display_name ?? null,
        avatar_url: profileData?.avatar_url ?? null,
      });

      setNeedsLogin(false);
      setLoading(false);
    };

    fetchProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  function upgradeGoogleAvatar(url: string) {
    return url.replace(/=s\d+-c$/, "=s512-c");
  }

  if (needsLogin) {
    return (
      <Box className="profile-page">
        <Box className="profile-login-gate">
          <p className="profile-login-kicker">Profil</p>
          <h1 className="profile-login-title">Log ind</h1>
          <p className="profile-login-text">
            Administrer dine oplysninger, favoritter og beskeder.
          </p>
          <Button variant="contained" onClick={signInWithGoogle} className="profile-login-button">
            Log ind med Google
          </Button>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return <p className="profile-page-status">Henter profil...</p>;
  }

  if (!profile) {
    return <p className="profile-page-status">Ingen profil fundet.</p>;
  }

  return (
    <Box className="profile-page">
      <Box className="profile-layout">
        <Box className="profile-image-column">
          <Box className="profile-image-stage">
            <Image
              src={upgradeGoogleAvatar(profile.avatar_url || "/placeholderprofile.jpg")}
              alt="Profilbillede"
              fill
              className="profile-image"
              priority
            />
          </Box>
        </Box>

        <Box className="profile-details">
          <div className="profile-info-top">
            <h1 className="profile-title">{profile.display_name ?? "Ikke udfyldt"}</h1>
            <p className="profile-label">Profil</p>
          </div>

          <p className="profile-description">{profile.email}</p>

          <Box className="profile-actions">
            {menuItems.map((item) => (
              <Button
                key={item.key}
                onClick={() => router.push(item.link)}
                className="profile-action-button"
              >
                {item.key === "messages" ? (
                  <Badge
                    color="error"
                    badgeContent={unreadMessageCount}
                    max={99}
                    invisible={unreadMessageCount === 0}
                  >
                    {item.label}
                  </Badge>
                ) : item.key === "notifications" ? (
                  <Badge
                    color="error"
                    badgeContent={unreadNotificationCount}
                    max={99}
                    invisible={unreadNotificationCount === 0}
                  >
                    {item.label}
                  </Badge>
                ) : (
                  item.label
                )}
              </Button>
            ))}
            <Button onClick={handleLogout} className="profile-action-button profile-action-button--logout">
              Log ud
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
