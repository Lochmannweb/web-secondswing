"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSentry } from "@/app/hooks/useSentry";

export function useNavigationTracking() {
  const pathname = usePathname();
  const { log } = useSentry();

  useEffect(() => {
    log("Navigation", { path: pathname });
  }, [pathname]);
}
