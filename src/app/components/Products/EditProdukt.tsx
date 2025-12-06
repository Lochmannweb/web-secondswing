// bliver måske ikke brugt, det skulle undersøges lidt mere
// hvis den ikke bliver brugt, så slet filen

"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Box, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl } from "@mui/material"
import Image from "next/image"
import { useEffect, useState } from "react"

interface EditProductProps {
  productId: string
}

export default function EditProduct({ productId }: EditProductProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [gender, setGender] = useState<"female" | "male" | "unisex">("female")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("/placeholderprofile.jpg")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error) {
        setMessage({ type: "error", text: `Kunne ikke hente produkt: ${error.message}` })
        return
      }

      if (data) {
        setTitle(data.title)
        setDescription(data.description)
        setPrice(data.price?.toString() || "")
        setGender(data.gender)
        setImagePreview(data.image_url || "/placeholderprofile.jpg")
      }
    }

    fetchProduct()
  }, [productId, supabase])

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

    const { error } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true })
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
      let imageUrl = imagePreview
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const { error } = await supabase
        .from("products")
        .update({
          title,
          description,
          price: price ? parseFloat(price) : null,
          gender,
          image_url: imageUrl,
        })
        .eq("id", productId)

      if (error) throw error

      setMessage({ type: "success", text: "Produkt opdateret succesfuldt!" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Der opstod en fejl" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Image
          src={imagePreview || "/placeholder.svg"}
          alt="Product preview"
          width={100}
          height={100}
          style={{ width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: "1rem", marginTop: "-4rem", paddingBottom: "10rem", backgroundColor: "white", position: "relative", zIndex: 10, color: "white", borderTopLeftRadius: "1.5rem", borderTopRightRadius: "1.5rem" }}>
        <TextField label="Produkt titel" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />

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
          {loading ? "Opdaterer..." : "Opdater Produkt"}
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
