"use client"

import React, { useState, useEffect } from "react"
import { Box, Button, Alert, Typography } from "@mui/material"
import { getSupabase } from "@/lib/supabaseClient"
import Image from "next/image"

export default function Profiloplysninger() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("/placeholderprofile.jpg")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [displayName, setDisplayName] = useState<string>("")
  

  // Hent profilens avatar_url når siden loader
  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = getSupabase()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("id", user.id)
        .single()

      if (!error && data?.avatar_url) {
        setImagePreview(data.avatar_url)
        if (data.display_name) setDisplayName(data.display_name)
      }
    }

    fetchProfile()
  }, [])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = getSupabase()
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file)
    if (uploadError) throw new Error(`Kunne ikke uploade billede: ${uploadError.message}`)

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
    if (!data?.publicUrl) throw new Error("Kunne ikke generere offentlig URL for billedet")
    return data.publicUrl
  }

  const handleSubmit = async () => {
    if (!imageFile) {
      setMessage({ type: "error", text: "Vælg et billede først" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const supabase = getSupabase()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Du skal være logget ind")

      const imageUrl = await uploadImage(imageFile)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: imageUrl })
        .eq("id", user.id)

      if (updateError) throw new Error(`Kunne ikke opdatere profil: ${updateError.message}`)

      setImagePreview(imageUrl) // Opdater preview til den rigtige public URL
      setMessage({ type: "success", text: "Profilbillede opdateret!" })
      setImageFile(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Der opstod en fejl" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
        <Box>
            <Button 
                variant="outlined" 
                component="label" 
                sx={{ 
                    color: "white",
                    border: "1px solid white",
                    top: "15rem",
                    justifySelf: "center",
                    display: "flex",
                    marginTop: "-2.3rem",
                    "&:hover": {
                        backgroundColor: "white",
                        color: "black"
                    }
                }}>
                Skift foto
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>
            <Image
                src={imagePreview}
                alt="Profil preview"
                width={100}
                height={100}
                style={{ 
                    width: "100%"
                }}
            />
        </Box>
        <Box
            sx={{
                backgroundColor: "white",
                padding: "1.5rem",
                color: "black",
                width: "100%",
                borderTopLeftRadius: "2rem",
                borderTopRightRadius: "2rem",
                marginTop: "-2rem",
                filter: "drop-shadow(2px 4px 6px black)",
                position: "fixed",
                bottom: "0",
                height: "50vh"
            }}
        >
            <Typography
                sx={{ 
                    paddingBottom: "1rem",
                    borderBottom: "1px solid grey",
                    cursor: "pointer" 
                }}>
                    Brugernavn: {  }
            </Typography>
            <Typography
                sx={{ 
                    padding: "1rem 0rem 1rem 0rem",
                    borderBottom: "1px solid grey",
                    cursor: "pointer" 
                }}
            >
                Min placering: </Typography>
            <Typography
                 sx={{ 
                    padding: "1rem 0rem 1rem 0rem",
                    borderBottom: "1px solid grey",
                    cursor: "pointer" 
                }}
            >
                Vis by i Profil: 
                {/* toogle knap */}
            </Typography>
            <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !imageFile}
                sx={{
                    display: "flex",
                    justifySelf: "center",
                    position: "absolute",
                    bottom: "7rem"
                }}
            >
                {loading ? "Gemmer..." : "Gem ændringer"}
            </Button>
            {message && <Alert severity={message.type}>{message.text}</Alert>}
        </Box>
    </Box>
  )
}


