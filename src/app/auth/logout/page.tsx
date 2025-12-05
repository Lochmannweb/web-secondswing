'use client'
import { getSupabaseClient } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
    const router = useRouter()
    const supabase = getSupabaseClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/')
    }

    return <button onClick={handleLogout}>Logout</button>
}
