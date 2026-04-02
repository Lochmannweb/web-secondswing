"use client"

import React, { useState, useEffect } from "react"
import { Box, Button, Alert, TextField } from "@mui/material"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
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
    "& .MuiInputBase-input": {
      color: "#f1f1f1",
      fontSize: "0.9rem",
      letterSpacing: "0.01em",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "rgba(255, 255, 255, 0.015)",
      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255, 215, 174, 0.35)" },
      "&.Mui-focused fieldset": { borderColor: "rgba(255, 215, 174, 0.55)" },
    },
    "& .MuiInputLabel-root": {
      color: "#b8b8b8",
      fontSize: "0.74rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#ffd7ae" },
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
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
      }

      if (!error && data?.display_name) {
        setDisplayName(data.display_name)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview((e.target?.result as string) || "/placeholderprofile.jpg")
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file)
    if (uploadError) {
      throw new Error(`Kunne ikke uploade billede: ${uploadError.message}`)
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
    if (!data?.publicUrl) {
      throw new Error("Kunne ikke generere offentlig URL for billedet")
    }

    return data.publicUrl
  }

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.push("/profile")
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("Du skal være logget ind")
      }

      let newAvatarUrl = imagePreview
      if (imageFile) {
        newAvatarUrl = await uploadImage(imageFile)
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: newAvatarUrl,
          display_name: displayName.trim(),
          updated_at: new Date(),
        })
        .eq("id", user.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

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
      if (authUpdateError) {
        throw new Error(authUpdateError.message)
      }

      setImagePreview(newAvatarUrl)
      setImageFile(null)
      setOriginalEmail(email.trim())
      setMessage({ type: "success", text: "Profil opdateret" })
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Der opstod en fejl"
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  function upgradeGoogleAvatar(url: string) {
    return url.replace(/=s\d+-c$/, "=s512-c")
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
            borderRadius: "0.45rem",
          }}
          priority
        />
      </Box>

      <Box className="profiloplysninger-form">
        <Box sx={{ display: { xs: "flex", sm: "none" }, mb: 1 }}>
          <Button
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
            sx={{
              color: "#d6d6d6",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: "6px",
              fontSize: "0.62rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              px: 1.2,
              py: 0.7,
              minWidth: "auto",
            }}
          >
            Tilbage
          </Button>
        </Box>

        <Box className="profiloplysninger-form-header">
          <p className="profiloplysninger-form-kicker">Rediger profil</p>
          <h3 className="profiloplysninger-form-title">Dine oplysninger</h3>
        </Box>

        <Button
          variant="outlined"
          component="label"
          fullWidth
          className="profiloplysninger-upload-button"
        >
          Vælg nyt billede
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
          minRows={4}
        />

        <Button
          variant="contained"
          fullWidth
          className="profiloplysninger-save-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Gemmer..." : "Gem ændringer"}
        </Button>

        {message && (
          <Alert severity={message.type} className="profiloplysninger-alert">
            {message.text}
          </Alert>
        )}
      </Box>
    </Box>
  )
}
