'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthRedirect() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        router.replace('/')
      } else {
        router.replace('/auth/login')
      }

    //   setLoading(false) // nu opdaterer vi loading
    }

    checkUser()
  }, [router])

  if (loading) return <p>Checking login...</p>
  return null
}
