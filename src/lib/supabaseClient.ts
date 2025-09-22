import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrl = "https://cldeqmnxqsjzbckmogyr.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsZGVxbW54cXNqemJja21vZ3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTg1MjYsImV4cCI6MjA3MTU5NDUyNn0.QJvbtBf9NfaEkVgmiX0vxmrnh73rosx4AkykBdWFAB8"


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment."
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getSupabase() {
  return supabase
}


