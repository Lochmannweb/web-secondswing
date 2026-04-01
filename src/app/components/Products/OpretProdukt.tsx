"use client"

import { createProduct } from "@/app/lib/crud"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Box, 
  TextField, 
  Button, 
  Alert, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  OutlinedInput,
  IconButton
} from "@mui/material"
import Image from "next/image"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import "./opretProdukt.css"

export default function CreateProduct() {
  const router = useRouter()
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
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  const supabase = getSupabaseClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setNeedsLogin(!user)
      setAuthChecked(true)
    }

    checkUser()
  }, [supabase])

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  useEffect(() => {
    if (message?.type !== "success") return

    const timeoutId = window.setTimeout(() => {
      router.push("/produkter")
    }, 2500)

    return () => window.clearTimeout(timeoutId)
  }, [message, router])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
        queryParams: { prompt: "select_account" },
      },
    })
  }





  

  // uploade image
  const uploadImage = async (file: File, userId: string, index: number): Promise<string> => {
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase()
    const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const filePath = `${userId}/${Date.now()}-${index}-${uniqueId}.${fileExt}`

    const { error } = await supabase.storage.from("avatars").upload(filePath, file)
    if (error) throw new Error(`Kunne ikke uploade billede: ${error.message}`)

    const {data: { publicUrl }, 
      } = supabase.storage.from("avatars").getPublicUrl(filePath)
    
      if (!publicUrl) throw new Error("Kunne ikke generere offentlig URL.")
    
      return publicUrl
  }


  // Form changes
  const updateField = (key: string, value: string) => {
    setForm((prev) => ({...prev, [key]: value}))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    imagePreviews.forEach((url) => URL.revokeObjectURL(url))

    setImageFiles(files)
    setImagePreviews(files.map((file) => URL.createObjectURL(file)))
    setActivePreviewIndex(0)

    // Allow selecting same files again later
    e.target.value = ""
  }

  const goToPreviousPreview = () => {
    setActivePreviewIndex((prev) => (prev === 0 ? imagePreviews.length - 1 : prev - 1))
  }

  const goToNextPreview = () => {
    setActivePreviewIndex((prev) => (prev === imagePreviews.length - 1 ? 0 : prev + 1))
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

      // Upload all selected images
      const uploadedUrls = imageFiles.length > 0
        ? await Promise.all(imageFiles.map((file, index) => uploadImage(file, user.id, index)))
        : []
      const primaryImageUrl = uploadedUrls[0] ?? null



      // CRUD - Create product 
      const createdProduct = await createProduct({
        user_id: user.id,
        ...form,
        price: Number(form.price),
        image_url: primaryImageUrl
      });

      // Save extra images to separate table if available.
      if (uploadedUrls.length > 1 && createdProduct?.id) {
        const extraImages = uploadedUrls.slice(1).map((url, index) => ({
          product_id: createdProduct.id,
          image_url: url,
          position: index + 1,
        }))

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(extraImages)

        if (imagesError?.code === "42P01") {
          throw new Error("Produkt blev gemt, men tabellen product_images mangler i databasen.")
        }

        if (imagesError) {
          throw new Error(`Produkt gemt, men ekstra billeder kunne ikke gemmes: ${imagesError.message}`)
        }
      }

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
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImageFiles([])
      setImagePreviews([])
      setActivePreviewIndex(0)


    } catch (error) {
      const msg = error instanceof Error ? error.message : "Der opstod en fejl."
      setMessage({ type: "error", text: msg })
    }

    setLoading(false)
  }



  if (!authChecked) {
    return null
  }

  if (needsLogin) {
    return (
      <Box className="opret-login-gate">
        <Alert severity="info" className="opret-login-alert">
          Du skal logge ind for at oprette en annonce.
        </Alert>
        <Button
          variant="contained"
          onClick={signInWithGoogle}
          className="opret-login-button"
        >
          Log ind med Google
        </Button>
      </Box>
    )
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      className="opret-form"
      >
      <Box className="opret-image-wrap">
          <Box className="opret-image-stage">
            <Box
              className="opret-image-track"
              sx={{ transform: `translateX(-${activePreviewIndex * 100}%)` }}
            >
              {(imagePreviews.length > 0 ? imagePreviews : ["/darkimgplaceholder.jpg"]).map((imageSrc, index) => (
                <Box key={`${imageSrc}-${index}`} className="opret-image-slide">
                  <Image
                    src={imageSrc}
                    alt={`Valgt billede ${index + 1}`}
                    fill
                    className="opret-image"
                  />
                </Box>
              ))}
            </Box>

            {imagePreviews.length > 1 && (
              <>
                <IconButton
                  onClick={goToPreviousPreview}
                  className="opret-image-nav opret-image-nav-prev"
                  aria-label="Forrige billede"
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <IconButton
                  onClick={goToNextPreview}
                  className="opret-image-nav opret-image-nav-next"
                  aria-label="Næste billede"
                >
                  <NavigateNextIcon />
                </IconButton>
              </>
            )}
          </Box>

          {imagePreviews.length > 1 && (
            <Box className="opret-image-dots">
              {imagePreviews.map((_, index) => (
                <span
                  key={`preview-dot-${index}`}
                  className={`opret-image-dot${index === activePreviewIndex ? " active" : ""}`}
                />
              ))}
            </Box>
          )}
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
            <InputLabel id="color-label">Farve</InputLabel>
            <Select
              labelId="color-label"
              id="color"
              label="Farve"
              value={form.color}
              onChange={(e) => updateField("color", e.target.value as "Hvid" | "Sort" | "Grå")}
              input={<OutlinedInput label="Farve" />}
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
            <InputLabel id="size-label">Størrelse</InputLabel>
          
            <Select
              labelId="size-label"
              id="size"
              label="Størrelse"
              value={form.size}
              onChange={(e) => updateField("size", e.target.value as "XS" | "S" | "M" | "L" | "XL")}
              input={<OutlinedInput label="Størrelse" />}
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
            <InputLabel id="gender-label">Køn</InputLabel>
          
            <Select
              labelId="gender-label"
              id="gender"
              label="Køn"
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value as "female" | "male")}
              input={<OutlinedInput label="Køn" />}
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
            <InputLabel id="stand-label">Tilstand</InputLabel>
          
            <Select
              labelId="stand-label"
              id="stand"
              label="Tilstand"
              value={form.stand}
              onChange={(e) => updateField("stand", e.target.value as "Nyt" | "Brugt" | "Brugspor")}
              input={<OutlinedInput label="Tilstand" />}
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
              multiple
              onChange={handleImageChange} 
            />
          </Button>

          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            fullWidth
            className="opret-submit-button"
            disabled={!form.title || !form.description || !form.color || !form.size || !form.gender || !form.stand || !form.price || imageFiles.length === 0}
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



