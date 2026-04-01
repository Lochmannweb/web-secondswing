"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { deleteProduct, updateProduct } from "@/app/lib/crud"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  IconButton,
} from "@mui/material"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import "./editProdukt.css"

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
  const router = useRouter()
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

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>([])
  const [productImages, setProductImages] = useState<string[]>([])
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const updateField = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedImagePreviews])

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

        const initialImages = product.image_url ? [product.image_url] : []

        const { data: extraImages, error: extraImagesError } = await supabase
          .from("product_images")
          .select("image_url, position")
          .eq("product_id", productId)
          .order("position", { ascending: true })

        if (extraImagesError && extraImagesError.code !== "42P01") {
          throw new Error(extraImagesError.message)
        }

        const mergedImages = !extraImagesError && extraImages
          ? [
              ...initialImages,
              ...extraImages.map((item) => item.image_url).filter(Boolean),
            ]
          : initialImages

        setProductImages(Array.from(new Set(mergedImages)))
        setActivePreviewIndex(0)
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
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    selectedImagePreviews.forEach((url) => URL.revokeObjectURL(url))

    setImageFiles(files)
    setSelectedImagePreviews(files.map((file) => URL.createObjectURL(file)))
    setActivePreviewIndex(0)
    e.target.value = ""
  }

  const uploadImage = async (file: File, userId: string, index: number): Promise<string> => {
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase()
    const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const filePath = `${userId}/${productId ?? "tmp"}-${Date.now()}-${index}-${uniqueId}.${fileExt}`

    const { error } = await supabase.storage.from("avatars").upload(filePath, file)
    if (error) throw new Error(`Kunne ikke uploade billede: ${error.message}`)

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
    return data.publicUrl
  }

  const goToPreviousPreview = () => {
    const displayImages = selectedImagePreviews.length > 0 ? selectedImagePreviews : productImages
    setActivePreviewIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const goToNextPreview = () => {
    const displayImages = selectedImagePreviews.length > 0 ? selectedImagePreviews : productImages
    setActivePreviewIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("Du skal være logget ind for at redigere produkter.")
      }

      // upload images if changed
      let imageUrl = form.image_url ?? null
      let uploadedUrls: string[] = []

      if (imageFiles.length > 0) {
        uploadedUrls = await Promise.all(imageFiles.map((file, index) => uploadImage(file, user.id, index)))
        imageUrl = uploadedUrls[0] ?? null
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

      if (uploadedUrls.length > 0) {
        const { error: deleteImagesError } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId)

        if (deleteImagesError && deleteImagesError.code !== "42P01") {
          throw new Error(deleteImagesError.message)
        }

        const extraImages = uploadedUrls.slice(1).map((url, index) => ({
          product_id: Number(productId),
          image_url: url,
          position: index + 1,
        }))

        if (extraImages.length > 0) {
          const { error: imagesError } = await supabase
            .from("product_images")
            .insert(extraImages)

          if (imagesError?.code === "42P01") {
            throw new Error("Produkt blev opdateret, men tabellen product_images mangler i databasen.")
          }

          if (imagesError) {
            throw new Error(`Produkt opdateret, men ekstra billeder kunne ikke gemmes: ${imagesError.message}`)
          }
        }

        setForm((prev) => ({ ...prev, image_url: uploadedUrls[0] ?? null }))
        setProductImages(uploadedUrls)
        selectedImagePreviews.forEach((url) => URL.revokeObjectURL(url))
        setSelectedImagePreviews([])
        setImageFiles([])
        setActivePreviewIndex(0)
      }

      setMessage({ type: "success", text: "Produkt opdateret!" })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ukendt fejl ved opdatering"
      setMessage({ type: "error", text: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!productId) return
    if (!isOwner) {
      setMessage({ type: "error", text: "Du har ikke tilladelse til at slette dette produkt." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error: extraImagesDeleteError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId)

      if (extraImagesDeleteError && extraImagesDeleteError.code !== "42P01") {
        throw new Error(extraImagesDeleteError.message)
      }

      await deleteProduct(productId)
      router.push("/profile")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kunne ikke slette produktet"
      setMessage({ type: "error", text: msg })
      setShowDeleteConfirm(false)
      setLoading(false)
    }
  }

  // UI: block if auth not checked or not owner
  if (!authChecked) {
    return (
      <Box className="edit-status-box">
        <p>Henter...</p>
      </Box>
    )
  }

  if (!isOwner) {
    return (
      <Box className="edit-status-box">
        {message ? <Alert severity={message.type}>{message.text}</Alert> : <Alert severity="error">Ingen adgang</Alert>}
      </Box>
    )
  }

  const displayImages = selectedImagePreviews.length > 0
    ? selectedImagePreviews
    : productImages.length > 0
      ? productImages
      : ["/darkimgplaceholder.jpg"]
 
  return (
    <Box component="form" onSubmit={handleSubmit} className="edit-form">
      <Box className="edit-image-wrap">
        <Box className="edit-image-stage">
          <Box
            className="edit-image-track"
            sx={{ transform: `translateX(-${activePreviewIndex * 100}%)` }}
          >
            {displayImages.map((imageSrc, index) => (
              <Box key={`${imageSrc}-${index}`} className="edit-image-slide">
                <Image
                  src={imageSrc}
                  alt={`Produkt preview ${index + 1}`}
                  fill
                  className="edit-image"
                />
              </Box>
            ))}
          </Box>

          {displayImages.length > 1 && (
            <>
              <IconButton
                onClick={goToPreviousPreview}
                className="edit-image-nav edit-image-nav-prev"
                aria-label="Forrige billede"
              >
                <NavigateBeforeIcon />
              </IconButton>
              <IconButton
                onClick={goToNextPreview}
                className="edit-image-nav edit-image-nav-next"
                aria-label="Næste billede"
              >
                <NavigateNextIcon />
              </IconButton>
            </>
          )}
        </Box>

        {displayImages.length > 1 && (
          <Box className="edit-image-dots">
            {displayImages.map((_, index) => (
              <span
                key={`edit-preview-dot-${index}`}
                className={`edit-image-dot${index === activePreviewIndex ? " active" : ""}`}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box className="edit-fields">
      <TextField
        label="Titel"
        value={form.title}
        onChange={(e) => updateField("title", e.target.value)}
        required
        fullWidth
        className="edit-input-field"
      />

      <TextField
        label="Beskrivelse"
        value={form.description}
        onChange={(e) => updateField("description", e.target.value)}
        fullWidth
        multiline
        rows={4}
        className="edit-input-field"
      />

      <FormControl 
        fullWidth 
        required 
        className="edit-select-field"
      >
        <InputLabel id="edit-color-label">Farve</InputLabel>
        <Select
          labelId="edit-color-label"
          id="edit-color"
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
        className="edit-select-field"
      >
        <InputLabel id="edit-size-label">Størrelse</InputLabel>
      
        <Select
          labelId="edit-size-label"
          id="edit-size"
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
        className="edit-select-field"
      >
        <InputLabel id="edit-gender-label">Køn</InputLabel>
      
        <Select
          labelId="edit-gender-label"
          id="edit-gender"
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
        className="edit-select-field"
      >
        <InputLabel id="edit-stand-label">Tilstand</InputLabel>
      
        <Select
          labelId="edit-stand-label"
          id="edit-stand"
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
        label="Pris (DKK)"
        type="number"
        value={form.price}
        onChange={(e) => updateField("price", e.target.value)}
        fullWidth
        className="edit-input-field"
      />

      <Button 
        variant="outlined" 
        component="label" 
        fullWidth 
        className="edit-image-button"
      >
          Skift billeder
        <input 
          type="file" 
          hidden accept="image/*"
          multiple
          onChange={handleImageChange} 
        />
      </Button>

      <Button 
        type="submit" 
        fullWidth 
        disabled={loading}
        className="edit-submit-button"
      >
        {loading ? "Opdaterer…" : "Gem ændringer"}
      </Button>

      {!showDeleteConfirm ? (
        <Button
          type="button"
          fullWidth
          disabled={loading}
          className="edit-delete-button"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Slet produkt
        </Button>
      ) : (
        <Box className="edit-delete-confirm-wrap">
          <p className="edit-delete-confirm-text">Er du sikker på, at du vil slette produktet?</p>
          <Box className="edit-delete-confirm-actions">
            <Button
              type="button"
              fullWidth
              disabled={loading}
              className="edit-cancel-button"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Annuller
            </Button>
            <Button
              type="button"
              fullWidth
              disabled={loading}
              className="edit-confirm-delete-button"
              onClick={handleDelete}
            >
              Bekræft sletning
            </Button>
          </Box>
        </Box>
      )}

      {message && (
        <Alert severity={message.type} className="edit-alert">
          {message.text}
        </Alert>
      )}
      </Box>
    </Box>
  )
}
