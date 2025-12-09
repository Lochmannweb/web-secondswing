"use client"

import { Button } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function StartChatButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  async function startChat() {
    if (isMobile) {
      router.push(`/chat/${productId}`)     // 👉 mobil-visning
    } else {
      router.push(`/chat/${productId}`) // 👉 desktop visning
    }
  }

  return (
    <Button 
        sx={{
            color: "white"
        }}
        onClick={startChat}>
      Start chat
    </Button>
  )
}
