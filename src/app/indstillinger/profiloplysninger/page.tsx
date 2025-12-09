"use client"

import React, { useState, useEffect } from "react"
import { Box, Button, Alert, TextField } from "@mui/material"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Profiloplysninger() {
  const [displayName, setDisplayName] = useState<string>("")
  

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("/placeholderprofile.jpg")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = getSupabaseClient()
  const router = useRouter()

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      color: "white",
      "& fieldset": { borderColor: "none" },
      "&:hover fieldset": { borderColor: "none" },
      "&.Mui-focused fieldset": { borderColor: "none" },
    },
    "& .MuiInputLabel-root": { color: "white" },
    "& .MuiInputLabel-root.Mui-focused": { color: "white" },
  }
  

  // Hent profilens avatar_url når siden loader
  useEffect(() => {
    const fetchProfile = async () => {
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
  }, [supabase])

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
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file)
    if (uploadError) throw new Error(`Kunne ikke uploade billede: ${uploadError.message}`)

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
    if (!data?.publicUrl) throw new Error("Kunne ikke generere offentlig URL for billedet")
    return data.publicUrl
  }

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Du skal være logget ind");

      let newAvatarUrl = imagePreview; 

      // Hvis der er valgt nyt billede → upload
      if (imageFile) {
        newAvatarUrl = await uploadImage(imageFile);
      }

      // Opdater ALT hvad der er ændret
      // const updates = {
      //   id: user.id,
      //   avatar_url: newAvatarUrl,
      //   display_name: displayName,
      //   updated_at: new Date(),
      // };

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          id: user.id,
          avatar_url: newAvatarUrl,
          display_name: displayName,
          updated_at: new Date(),
        })
        .eq("id", user.id);

      if (updateError) throw new Error(updateError.message);

      setImagePreview(newAvatarUrl);
      setImageFile(null);

      setMessage({ type: "success", text: "Profil opdateret!" });
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Der opstod en fejl" });
    } finally {
      setLoading(false);
    }
  };


  // opdater kvalitet på google profil billede, da googles opløsning af billeder er ekstrem lort
  function upgradeGoogleAvatar(url: string) {
    return url.replace(/=s\d+-c$/, "=s512-c");
  }

  return (
    <Box p={2} display={{ xs: "grid", sm: "flex" }} justifyContent={{ sm: "center" }} gap={2} height={{ sm: "80vh" }}>
      <Box alignSelf={{sm: "center"}}>
        <Image
            src={upgradeGoogleAvatar(imagePreview)}
            alt="Profil preview"
            width={800}
            height={100}
            style={{ 
                width: "100%",
                height: "50vh",
                objectFit: "cover",
                marginTop: "4rem",
                borderRadius: "0.3rem",
            }}
            priority
        />
      </Box>

      <Box sx={{ backgroundColor: "#121212ff", borderRadius: "0.3rem"}} alignSelf={{ sm: "center" }} >
        <Button 
            variant="outlined" 
            component="label"
            fullWidth 
            sx={{ 
                color: "gray",
                border: "none",
                justifyContent: "left",
                "&:hover": {
                    backgroundColor: "#0b0b0bc3",
                }
            }}>
              Skift profil billede
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>

        <TextField 
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
          sx={inputStyle}
          placeholder="Navn: "
        />

        <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            // disabled={loading || !imageFile}
            sx={{
              backgroundColor: "transparent",
              justifyContent: "left",
              color: "gray",
              "&:hover": {
                backgroundColor: "#0b0b0bc3",
              }
            }}
        >
            {loading ? "Gemmer..." : "Gem ændringer"}
        </Button>

        {message && <Alert severity={message.type}>{message.text}</Alert>}
      </Box>
    </Box>
  )
}


