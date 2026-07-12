"use client";

import { syncCurrentLoginSession } from "@/app/lib/securitySettings";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import { useEffect, useMemo, useRef } from "react";

const SYNC_KEY = "ss-device-sync";
const SYNC_INTERVAL_MS = 2 * 60 * 1000;

export function useSyncLoginDevice() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const syncingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const sync = async (force = false) => {
      if (syncingRef.current) return;

      const { data } = await supabase.auth.getSession();
      if (!data.session?.user || cancelled) return;

      const lastSync = sessionStorage.getItem(SYNC_KEY);
      const now = Date.now();
      if (!force && lastSync && now - Number(lastSync) < SYNC_INTERVAL_MS) return;

      syncingRef.current = true;
      try {
        await syncCurrentLoginSession(supabase);
        sessionStorage.setItem(SYNC_KEY, String(now));
      } finally {
        syncingRef.current = false;
      }
    };

    sync(true);

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        sessionStorage.removeItem(SYNC_KEY);
        sync(true);
      }
    });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [supabase]);
}
