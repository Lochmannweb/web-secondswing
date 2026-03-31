"use client"

import React, { useState, useEffect } from "react"
import { Box, Button, Alert, TextField } from "@mui/material"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Profiloplysninger() {
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  const [originalEmail, setOriginalEmail] = useState("")
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

      setEmail(user.email ?? "")
      setOriginalEmail(user.email ?? "")
      setPhone((user.user_metadata?.phone as string) ?? "")
      setLocation((user.user_metadata?.location as string) ?? "")
      setBio((user.user_metadata?.bio as string) ?? "")

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
          avatar_url: newAvatarUrl,
          display_name: displayName.trim(),
          updated_at: new Date(),
        })
        .eq("id", user.id);

      if (updateError) throw new Error(updateError.message);

      const authUpdates: {
        email?: string
        data?: Record<string, string>
      } = {}

      if (email.trim() && email.trim() !== originalEmail) {
        authUpdates.email = email.trim()
      }

      authUpdates.data = {
        ...user.user_metadata,
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
        display_name: displayName.trim(),
      }

      const { error: authUpdateError } = await supabase.auth.updateUser(authUpdates)
      if (authUpdateError) throw new Error(authUpdateError.message)

      setImagePreview(newAvatarUrl);
      setImageFile(null);
      setOriginalEmail(email.trim())

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
    <Box
      className="profiloplysninger-grid"
      display="grid"
      gap={2}
      gridTemplateColumns={{ xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" }}
      alignItems="start"
    >
      <Box className="profiloplysninger-image-wrap">
        <Image
            src={upgradeGoogleAvatar(imagePreview)}
            alt="Profil preview"
            width={500}
            height={500}
            className="profiloplysninger-image"
            style={{ 
                width: "100%",
                height: "auto",
                borderRadius: "0.3rem",
            }}
            priority
        />
      </Box>

      <Box className="profiloplysninger-form" sx={{ borderRadius: "0.3rem" }}>
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
          label="Navn"
          margin="dense"
        />

        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          sx={inputStyle}
          label="Email"
          type="email"
          margin="dense"
        />

        <TextField
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          sx={inputStyle}
          label="Telefon"
          margin="dense"
        />

        <TextField
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          sx={inputStyle}
          label="Lokation"
          margin="dense"
        />

        <TextField
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          fullWidth
          sx={inputStyle}
          label="Om mig"
          margin="dense"
          multiline
          minRows={3}
        />

        <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
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


