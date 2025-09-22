'use client'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
    const router = useRouter()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/')
    }

    return <button onClick={handleLogout}>Logout</button>
}
