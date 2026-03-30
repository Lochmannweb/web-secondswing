"use client"

import { createProduct } from "@/app/lib/crud"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import type React from "react"
import { useState } from "react"
import { 
  Box, 
  TextField, 
  Button, 
  Alert, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  OutlinedInput 
} from "@mui/material"
import Image from "next/image"
import { updateProfile } from "@/app/actions"

export default function CreateProduct() {
  const [ form, setForm ] = useState({
    title: "",
    description: "",
    price: "",
    gender: "",
    color: "",
    size: "",
    stand: "",
  })



  // State Management
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  const supabase = getSupabaseClient();





  

  // uploade image
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error } = await supabase.storage.from("avatars").upload(fileName, file)
    if (error) throw new Error(`Kunne ikke uploade billede.`)

    const {data: { publicUrl }, 
      } = supabase.storage.from("avatars").getPublicUrl(fileName)
    
      if (!publicUrl) throw new Error("Kunne ikke generere offentlig URL.")
    
      return publicUrl
  }


  // Form changes
  const updateField = (key: string, value: string) => {
    setForm((prev) => ({...prev, [key]: value}))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }




  // bruger CRUD.ts 
  // Submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser() // Grundstruktur af error handling i frontend
      if (userError || !user) throw new Error("Du skal være logget ind først")

      // Upload image
      let imageUrl = null
      if (imageFile) imageUrl = await uploadImage(imageFile);



      // CRUD - Create product 
      await createProduct({
        user_id: user.id,
        ...form,
        price: Number(form.price),
        image_url: imageUrl
      });
      setMessage({ type: "success", text: "Produkt blev oprettet!" }) // viser error besked på skærmen, en del af error handling via frontend



      // Reset form
      setForm({
        title: "",
        description: "",
        price: "",
        gender: "Female",
        color: "Farve",
        size: "Størrelse",
        stand: "Tilstand",
      })
      setImageFile(null)


    } catch (error) {
      const msg = error instanceof Error ? error.message : "Der opstod en fejl."
      setMessage({ type: "error", text: msg })
    }

    setLoading(false)
  }



  return (
    <Box 
      component="form" 
      action={updateProfile}
      onSubmit={handleSubmit}
      className="opret-form"
      >
      <Box className="opret-image-wrap">
          <Image
            src={imagePreview || "/placeholderprofile.jpg"}
            alt="Valgt billede"
            width={800}
            height={100}
            className="opret-image"
          />
      </Box>

      <Box className="opret-fields">
          <TextField
            label="Title *"
            variant="outlined"
            value={form.title} 
            onChange={(e) => updateField("title", e.target.value)} 
            required 
            fullWidth
            className="opret-input-field"
          />

          <TextField 
            label="Beskrivelse *"
            variant="outlined"
            value={form.description} 
            onChange={(e) => updateField("description", e.target.value)} 
            required 
            fullWidth
            className="opret-input-field"
          />

          <FormControl 
            fullWidth 
            required 
            className="opret-select-field"
          >
            <InputLabel>Farve</InputLabel>
            <Select
              value={form.color}
              onChange={(e) => updateField("color", e.target.value as "Hvid" | "Sort" | "Grå")}
              input={ <OutlinedInput label="Farve" /> }
            >
              <MenuItem value="Hvid">Hvid</MenuItem>
              <MenuItem value="Sort">Sort</MenuItem>
              <MenuItem value="Grå">Grå</MenuItem>
            </Select>
          </FormControl>    

          <FormControl 
            fullWidth 
            required 
            className="opret-select-field"
          >
            <InputLabel>Størrelse</InputLabel>
          
            <Select
              label="Størrelse"
              value={form.size}
              onChange={(e) => updateField("size", e.target.value as "XS" | "S" | "M" | "L" | "XL")}
              input={ <OutlinedInput label="Størrelse" /> }
            >
              <MenuItem value="XS">XS</MenuItem>
              <MenuItem value="S">S</MenuItem>
              <MenuItem value="M">M</MenuItem>
              <MenuItem value="L">L</MenuItem>
              <MenuItem value="XL">XL</MenuItem>
            </Select>
          </FormControl>    

          <FormControl 
            fullWidth 
            required 
            className="opret-select-field"
          >
            <InputLabel>Køn</InputLabel>
          
            <Select
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value as "female" | "male")}
              input={ <OutlinedInput label="Gender" /> }
            >
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="male">Male</MenuItem>
            </Select>
          </FormControl>     

          <FormControl 
            fullWidth 
            required 
            className="opret-select-field"
          >
            <InputLabel>Tilstand</InputLabel>
          
            <Select
              label="Tilstand"
              value={form.stand}
              onChange={(e) => updateField("stand", e.target.value as "Nyt" | "Brugt" | "Brugspor")}
              input={ <OutlinedInput label="Tilstand" /> }
            >
              <MenuItem value="Nyt">Nyt</MenuItem>
              <MenuItem value="Brugt">Brugt</MenuItem>
              <MenuItem value="Brugspor">Brugspor</MenuItem>
            </Select>
          </FormControl>          

          <TextField 
            label="Pris" 
            variant="outlined"
            value={form.price} 
            onChange={(e) => updateField("price", e.target.value)} 
            required 
            fullWidth
            className="opret-input-field"
          />


          <Button 
            variant="outlined" 
            component="label"
            fullWidth
            className="opret-image-button"
            >
              Vælg billede

            <input 
              type="file" 
              hidden 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </Button>

          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            fullWidth
            className="opret-submit-button"
            disabled={!form.title || !form.description || !form.color || !form.size || !form.gender || !form.stand || !form.price || !imageFile}
          >
            {loading ? "Opretter..." : "Opret Produkt"}
          </Button>


          {message && (
            <Alert severity={message.type}>
              {message.text}
            </Alert>
          )}
      </Box>
    </Box>
  )
}



