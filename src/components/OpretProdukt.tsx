"use client"

import { getSupabase } from "@/lib/supabaseClient"
import { Box, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl } from "@mui/material"
import type React from "react"
import { useState } from "react"

export default function CreateProduct() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [gender, setGender] = useState<"female" | "male" | "unisex">("female")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("/placeholderprofile.jpg")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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

    const { data, error } = await supabase.storage.from("avatars").upload(fileName, file)
    if (error) throw new Error(`Kunne ikke uploade billede: ${error.message}`)

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName)
    if (!publicUrl) throw new Error("Kunne ikke generere offentlig URL for billedet")
    return publicUrl
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = getSupabase()

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Du skal være logget ind for at oprette et produkt")

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code === "PGRST116") {
        const { error: createProfileError } = await supabase.from("profiles").insert({
          id: user.id,
          created_at: new Date().toISOString(),
        })
        if (createProfileError) throw new Error(`Kunne ikke oprette brugerprofil: ${createProfileError.message}`)
      } else if (profileError) {
        throw new Error(`Fejl ved tjek af brugerprofil: ${profileError.message}`)
      }

      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      // Insert product inkl. gender
      const { error: insertError } = await supabase.from("products").insert({
        user_id: user.id,
        title,
        description,
        price: price ? Number.parseFloat(price) : null,
        gender, // <--- gender tilføjet
        image_url: imageUrl,
      })

      if (insertError) throw insertError

      setMessage({ type: "success", text: "Produkt oprettet succesfuldt!" })

      // Reset form
      setTitle("")
      setDescription("")
      setPrice("")
      setGender("female")
      setImageFile(null)
      setImagePreview("/placeholderprofile.jpg")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Der opstod en fejl" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Upload billede */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <img
          src={imagePreview || "/placeholder.svg"}
          alt="Product preview"
          style={{ width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: "1rem", marginTop: "-4rem", paddingBottom: "10rem", backgroundColor: "white", position: "relative", zIndex: 10, color: "white", borderTopLeftRadius: "1.5rem", borderTopRightRadius: "1.5rem" }}>
        <TextField label="Produkt titel" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth placeholder="Produkt title" />

        <TextField label="Beskrivelse" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={4} fullWidth />

        <TextField label="Pris (DKK)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} inputProps={{ step: "0.01", min: "0" }} fullWidth />

        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select value={gender} onChange={(e) => setGender(e.target.value as "female" | "male" | "unisex")}>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="unisex">Unisex</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" component="label">
          Vælg billede
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>

        <Button type="submit" variant="contained" size="large" disabled={loading || !title}>
          {loading ? "Opretter..." : "Opret Produkt"}
        </Button>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}
      </Box>
    </Box>
  )
}
