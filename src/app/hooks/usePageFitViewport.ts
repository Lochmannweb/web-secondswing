"use client";

import { useEffect } from "react";

export function usePageFitViewport() {
  useEffect(() => {
    document.body.classList.add("page-fit-viewport");
    return () => document.body.classList.remove("page-fit-viewport");
  }, []);
}
