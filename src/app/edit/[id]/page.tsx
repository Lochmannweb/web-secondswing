"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { updateProduct } from "@/app/lib/crud"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
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
} from "@mui/material"
import { updateProfile } from "@/app/actions"

type FormState = {
  title: string
  description: string
  price: string 
  gender: "female" | "male" 
  color: string
  size: string
  stand: string
  image_url?: string | null
}

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string | undefined
  const supabase = getSupabaseClient()

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price: "",
    gender: "female",
    color: "Farve",
    size: "Størrelse",
    stand: "Tilstand",
    image_url: null,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  //  Shared mui props
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      color: "white",
      "& fieldset": { borderColor: "none" },
      "&:hover fieldset": { borderColor: "none" },
      "&.Mui-focused fieldset": { borderColor: "none" },
    },
    "& .MuiInputLabel-root": { color: "gray" },
    "& .MuiInputLabel-root.Mui-focused": { color: "gray" },
  }

  const updateField = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // fetch product + auth & ownership check
  useEffect(() => {
    if (!productId) {
      setMessage({ type: "error", text: "Produkt-id mangler." })
      setAuthChecked(true)
      return
    }

    const load = async () => {
      try {
        // 1) check session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setMessage({ type: "error", text: "Du skal være logget ind for at redigere produkter." })
          setAuthChecked(true)
          return
        }

        // 2) fetch product
        const { data: product, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single()

        if (error) throw new Error(error.message)
        if (!product) {
          setMessage({ type: "error", text: "Produkt ikke fundet." })
          setAuthChecked(true)
          return
        }

        // 3) ownership
        if (product.user_id !== session.user.id) {
          setMessage({ type: "error", text: "Du ejer ikke dette produkt." })
          setAuthChecked(true)
          return
        }

        setIsOwner(true)

        // 4) populate form
        setForm({
          title: product.title ?? "",
          description: product.description ?? "",
          price: product.price != null ? String(product.price) : "",
          gender: (product.gender as FormState["gender"]) ?? "female",
          color: product.color ?? "Farve",
          size: product.size ?? "Størrelse",
          stand: product.stand ?? "Tilstand",
          image_url: product.image_url ?? null,
        })

        setImagePreview(product.image_url ?? null)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Fejl ved hentning"
        setMessage({ type: "error", text: msg })
      } finally {
        setAuthChecked(true)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop()
    const path = `${productId ?? "tmp"}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    if (!isOwner) {
      setMessage({ type: "error", text: "Du har ikke tilladelse til at opdatere dette produkt." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // upload image first if changed
      let imageUrl = form.image_url ?? null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      // prepare updates (convert price)
      const updates: Partial<FormState> = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price,
        gender: form.gender,
        color: form.color,
        size: form.size,
        stand: form.stand,
        image_url: imageUrl,
      }

      // call shared CRUD update (throws on error)
      await updateProduct(productId, updates)

      setMessage({ type: "success", text: "Produkt opdateret!" })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ukendt fejl ved opdatering"
      setMessage({ type: "error", text: msg })
    } finally {
      setLoading(false)
    }
  }

  // UI: block if auth not checked or not owner
  if (!authChecked) {
    return (
      <Box p={"2rem"} position={"absolute"} top={"5rem"} justifySelf={"center"}>
        <p>Henter...</p>
      </Box>
    )
  }

  if (!isOwner) {
    return (
      <Box p={"2rem"} position={"absolute"} top={"5rem"} justifySelf={"center"}>
        {message ? <Alert severity={message.type}>{message.text}</Alert> : <Alert severity="error">Ingen adgang</Alert>}
      </Box>
    )
  }
 
  return (
    <Box component="form" action={updateProfile}  onSubmit={handleSubmit} position={"absolute"} p={2} top={{ xs: "8rem", sm: "6rem" }} display={{ sm: "flex" }} justifyContent={{ sm: "center" }} gap={{ sm: "2rem" }} height={{ sm: "80vh" }}>

      <Box justifySelf={"center"} alignSelf={"center"}>
          <Box mb={2}>
            <Image 
              src={imagePreview || "/placeholderprofile.jpg"} 
              alt="preview"
              width={420} 
              height={100} 
              style={{ width: "100%", height: "70vh", objectFit: "cover", borderRadius: "0.5rem" }} 
            />
          </Box>
      </Box>

      <Box sx={{ marginTop: "1rem", backgroundColor: "#121212ff", borderRadius: "0.3rem", width: { sm:"30%" }}}>
      <TextField
        label="Titel"
        value={form.title}
        onChange={(e) => updateField("title", e.target.value)}
        required
        fullWidth
        sx={inputStyle}
      />

      <TextField
        label="Beskrivelse"
        value={form.description}
        onChange={(e) => updateField("description", e.target.value)}
        fullWidth
        multiline
        rows={4}
        sx={inputStyle}
      />

      <FormControl 
        fullWidth 
        required 
        sx={inputStyle}
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
        sx={inputStyle}
      >
        <InputLabel>Størrelse</InputLabel>
      
        <Select
          label="Størrelse"
          value={form.size}
          onChange={(e) => updateField("size", e.target.value as "XS" | "S" | "M" | "L" | "XL")}
          input={ <OutlinedInput label="Størrelse" /> }
          sx={{ color: "white" }}
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
        sx={inputStyle}
      >
        <InputLabel>Køn</InputLabel>
      
        <Select
          value={form.gender}
          onChange={(e) => updateField("gender", e.target.value as "female" | "male")}
          input={ <OutlinedInput label="Gender" /> }
          sx={{ color: "white" }}
        >
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="male">Male</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={inputStyle}>
        <InputLabel>Køn</InputLabel>
        <Select value={form.gender} onChange={(e) => updateField("gender", e.target.value as FormState["gender"])}>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="unisex">Unisex</MenuItem>
        </Select>
      </FormControl>


      <FormControl 
        fullWidth 
        required 
        sx={inputStyle}
      >
        <InputLabel>Tilstand</InputLabel>
      
        <Select
          label="Tilstand"
          value={form.stand}
          onChange={(e) => updateField("stand", e.target.value as "Nyt" | "Brugt" | "Brugspor")}
          input={ <OutlinedInput label="Tilstand" /> }
          sx={{ color: "white" }}
        >
          <MenuItem value="Nyt">Nyt</MenuItem>
          <MenuItem value="Brugt">Brugt</MenuItem>
          <MenuItem value="Brugspor">Brugspor</MenuItem>
        </Select>
      </FormControl> 

      <TextField
        label="Pris (DKK)"
        type="number"
        value={form.price}
        onChange={(e) => updateField("price", e.target.value)}
        fullWidth
        sx={inputStyle}
      />

      <Button 
        variant="outlined" 
        component="label" 
        fullWidth 
        sx={{
          justifyContent: "left",
          color: "gray",
          border: "none",
          "&:hover": { 
            backgroundColor: "#0b0b0bc3" 
          } 
        }}>
          Skift billede
        <input 
          type="file" 
          hidden accept="image/*" 
          onChange={handleImageChange} 
        />
      </Button>

      <Button 
        type="submit" 
        fullWidth 
        disabled={loading}
        sx={{
          justifyContent: "left",
          color: "gray",
          border: "none",
          mt: "2rem",
          "&:hover": { 
            backgroundColor: "#0b0b0bc3" 
          } 
        }}
        >
        {loading ? "Opdaterer…" : "Gem ændringer"}
      </Button>

      {message && (
        <Alert severity={message.type} sx={{ mt:2 }}>
          {message.text}
        </Alert>
      )}
      </Box>
    </Box>
  )
}
