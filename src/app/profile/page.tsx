"use client";

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
  { key: "messages", label: "Beskeder", link: "/chats", primary: false },
  { key: "fav", label: "Favoritter", link: "/favoriter", primary: false },
  { key: "myProducts", label: "Mine produkter", link: "/produkter", primary: false },
  { key: "createProduct", label: "Sælg nyt udstyr", link: "/opretProdukt", primary: true },
  { key: "editProfile", label: "Rediger profil", link: "/indstillinger/profiloplysninger", primary: false },
  { key: "privacy", label: "Indstillinger", link: "/indstillinger/privatliv", primary: false },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
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

      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", currentUserId)
        .is("read_at", null);

      if (isMounted) setUnreadMessageCount(count ?? 0);
    };

    loadUnreadCount();

    const channelPromise = supabase.auth.getUser().then(({ data }) => {
      const currentUserId = data.user?.id;
      if (!currentUserId) return null;

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
          loadUnreadCount
        )
        .subscribe();
    });

    return () => {
      isMounted = false;
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel);
      });
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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single();

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
                className={`profile-action-button${item.primary ? " profile-action-button--primary" : ""}`}
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
                ) : (
                  item.label
                )}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
