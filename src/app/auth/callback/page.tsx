'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      router.replace('/shop')
    })
  }, [router])

  return null
}

