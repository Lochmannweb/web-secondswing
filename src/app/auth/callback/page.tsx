'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/app/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      router.replace('/shop')
    })
  }, [router, supabase.auth])

  return null
}

