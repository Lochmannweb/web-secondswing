'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, Typography } from '@mui/material'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message === 'Email not confirmed') {
        alert('Tjek din e-mail for at bekræfte din konto, før du kan logge ind.')
      } else {
        console.error(error)
        alert('Fejl ved login: ' + error.message)
      }
    } else if (data.user) {
      console.log('Logged in:', data)
      router.push('/profile')
    }
  }

  // Google login setup
  useEffect(() => {
    const script = document.createElement('script')
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: async (response: any) => {
            const { credential } = response

            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: credential,
            })

            if (error) {
              console.error(error)
              alert("Fejl ved Google login: " + error.message)
            } else {
              console.log('Supabase user:', data)
              router.push('/profile')
            }
          },
        })

        // Google renderer knappen selv
        window.google.accounts.id.renderButton(
          document.getElementById("google-login-btn"),
          { theme: "outline", size: "large", text: "continue_with" }
        )
      }
    }
    document.body.appendChild(script)
  }, [router])

  return (
    <Box sx={{ padding: "1rem", height: "100vh", alignContent: "center", backgroundColor: "black", color: "white" }}>
      <Typography sx={{ fontSize: "2.5rem", textAlign: "center" }}>Login</Typography>
      <form style={{ display: "grid", gap: "1rem" }} onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          style={{ 
            background: "transparent", 
            padding: "1rem", 
            border: "none", 
            borderBottom: "1px solid white" 
          }}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          style={{ 
            background: "transparent", 
            padding: "1rem", 
            border: "none", 
            borderBottom: "1px solid white" 
          }}
          onChange={e => setPassword(e.target.value)}
        />

        <Button
          sx={{ 
            padding: "1rem",
            border: "none",
            color: "white",
            backgroundColor: "grey",
            "&:hover": {
              backgroundColor: "white",
              color: "black"
            },
          }}  
          type="submit">
            Login
        </Button>

        {/* Google login knap – renderer automatisk af Google */}
        <Box 
          id="google-login-btn" 
          sx={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}
        />

        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifySelf: "center" }}>
          <p style={{ fontSize: "0.7rem" }}>Har du ikke allerede en konto?</p>
          <Button
            href='/auth/signup'
            sx={{
              color: "white",
              "&:hover": {
                color: "blue",
                background: "none"
              }
            }}>
              Signup
          </Button>
        </Box>
      </form>
    </Box>
  )
}
