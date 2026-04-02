"use client"

import { createProduct } from "@/app/lib/crud"
import {
  buildProductPayload,
  CATEGORY_OPTIONS,
  createEmptyProductForm,
  getCategoryFields,
  isProductFormComplete,
  ProductFieldDefinition,
  ProductFormState,
  STAND_OPTIONS,
} from "@/app/lib/productForm"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import Image from "next/image"
import "./opretProdukt.css"

export default function CreateProduct() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [form, setForm] = useState<ProductFormState>(() => createEmptyProductForm())
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const useNativeSelect = useMemo(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia("(hover: none), (pointer: coarse)").matches
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

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
    if (message?.type !== "success") {
      return
    }

    const timeoutId = window.setTimeout(() => {
      router.push("/produkter")
    }, 2500)

    return () => window.clearTimeout(timeoutId)
  }, [message, router])

  const updateField = (key: keyof ProductFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const uploadImage = async (file: File, userId: string, index: number): Promise<string> => {
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase()
    const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const filePath = `${userId}/${Date.now()}-${index}-${uniqueId}.${fileExt}`

    const { error } = await supabase.storage.from("avatars").upload(filePath, file)

    if (error) {
      throw new Error(`Kunne ikke uploade billede: ${error.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    if (!publicUrl) {
      throw new Error("Kunne ikke generere offentlig URL.")
    }

    return publicUrl
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    setImageFiles(files)
    setImagePreviews(files.map((file) => URL.createObjectURL(file)))
    setActivePreviewIndex(0)
    event.target.value = ""
  }

  const goToPreviousPreview = () => {
    setActivePreviewIndex((prev) => (prev === 0 ? imagePreviews.length - 1 : prev - 1))
  }

  const goToNextPreview = () => {
    setActivePreviewIndex((prev) => (prev === imagePreviews.length - 1 ? 0 : prev + 1))
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
        queryParams: { prompt: "select_account" },
      },
    })
  }

  const categoryFields = getCategoryFields(form.category)

  const renderField = (field: ProductFieldDefinition) => {
    if (field.kind === "select" && field.options) {
      if (useNativeSelect) {
        return (
          <FormControl key={field.key} fullWidth required className="opret-select-field">
            <InputLabel shrink htmlFor={`${field.key}-native`}>
              {field.label}
            </InputLabel>
            <Select
              native
              id={`${field.key}-native`}
              value={form[field.key]}
              onChange={(event) => updateField(field.key, event.target.value)}
              input={<OutlinedInput notched label={field.label} />}
            >
              <option value="" disabled>
                Vaelg {field.label.toLowerCase()}
              </option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>
        )
      }

      return (
        <FormControl key={field.key} fullWidth required className="opret-select-field">
          <InputLabel id={`${field.key}-label`}>{field.label}</InputLabel>
          <Select
            labelId={`${field.key}-label`}
            id={field.key}
            label={field.label}
            value={form[field.key]}
            onChange={(event) => updateField(field.key, event.target.value)}
            input={<OutlinedInput label={field.label} />}
          >
            <MenuItem value="" disabled>
              Vaelg {field.label.toLowerCase()}
            </MenuItem>
            {field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }

    return (
      <TextField
        key={field.key}
        label={field.label}
        type={field.kind === "number" ? "number" : "text"}
        value={form[field.key]}
        onChange={(event) => updateField(field.key, event.target.value)}
        required
        fullWidth
        className="opret-input-field"
      />
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("Du skal vaere logget ind foerst")
      }

      const uploadedUrls = imageFiles.length > 0
        ? await Promise.all(imageFiles.map((file, index) => uploadImage(file, user.id, index)))
        : []
      const primaryImageUrl = uploadedUrls[0] ?? null

      const productPayload = buildProductPayload(form)

      if (!productPayload.category) {
        throw new Error("Vaelg en kategori for produktet.")
      }

      if (productPayload.price === null || Number.isNaN(productPayload.price) || productPayload.price <= 0) {
        throw new Error("Indtast en gyldig pris stoerre end 0.")
      }

      const createdProduct = await createProduct({
        user_id: user.id,
        ...productPayload,
        image_url: primaryImageUrl,
      })

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

      setMessage({ type: "success", text: "Produkt blev oprettet!" })
      setForm(createEmptyProductForm())
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImageFiles([])
      setImagePreviews([])
      setActivePreviewIndex(0)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Der opstod en fejl."
      setMessage({ type: "error", text: msg })
    } finally {
      setLoading(false)
    }
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
        <Button variant="contained" onClick={signInWithGoogle} className="opret-login-button">
          Log ind med Google
        </Button>
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="opret-form">
      <Box className="opret-image-wrap">
        <Box className="opret-image-stage">
          <Box
            className="opret-image-track"
            sx={{ transform: `translateX(-${activePreviewIndex * 100}%)` }}
          >
            {(imagePreviews.length > 0 ? imagePreviews : ["/darkimgplaceholder.jpg"]).map((imageSrc, index) => (
              <Box key={`${imageSrc}-${index}`} className="opret-image-slide">
                <Image src={imageSrc} alt={`Valgt billede ${index + 1}`} fill className="opret-image" />
              </Box>
            ))}
          </Box>

          {imagePreviews.length > 1 ? (
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
                aria-label="Naeste billede"
              >
                <NavigateNextIcon />
              </IconButton>
            </>
          ) : null}
        </Box>

        {imagePreviews.length > 1 ? (
          <Box className="opret-image-dots">
            {imagePreviews.map((_, index) => (
              <span
                key={`preview-dot-${index}`}
                className={`opret-image-dot${index === activePreviewIndex ? " active" : ""}`}
              />
            ))}
          </Box>
        ) : null}
      </Box>

      <Box className="opret-fields">
        <FormControl fullWidth required className="opret-select-field">
          {useNativeSelect ? (
            <>
              <InputLabel shrink htmlFor="category-native">
                Kategori
              </InputLabel>
              <Select
                native
                id="category-native"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                input={<OutlinedInput notched label="Kategori" />}
              >
                <option value="" disabled>
                  Vaelg kategori
                </option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </>
          ) : (
            <>
              <InputLabel id="category-label">Kategori</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                label="Kategori"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                input={<OutlinedInput label="Kategori" />}
              >
                <MenuItem value="" disabled>
                  Vaelg kategori
                </MenuItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </FormControl>

        <TextField
          label="Titel"
          variant="outlined"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          required
          fullWidth
          className="opret-input-field"
        />

        <TextField
          label="Beskrivelse"
          variant="outlined"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          required
          fullWidth
          multiline
          rows={4}
          className="opret-input-field"
        />

        <TextField
          label="Pris"
          variant="outlined"
          type="number"
          value={form.price}
          onChange={(event) => updateField("price", event.target.value)}
          required
          fullWidth
          className="opret-input-field"
        />

        {categoryFields.map(renderField)}

        <FormControl fullWidth required className="opret-select-field">
          {useNativeSelect ? (
            <>
              <InputLabel shrink htmlFor="stand-native">
                Tilstand
              </InputLabel>
              <Select
                native
                id="stand-native"
                value={form.stand}
                onChange={(event) => updateField("stand", event.target.value)}
                input={<OutlinedInput notched label="Tilstand" />}
              >
                <option value="" disabled>
                  Vaelg tilstand
                </option>
                {STAND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </>
          ) : (
            <>
              <InputLabel id="stand-label">Tilstand</InputLabel>
              <Select
                labelId="stand-label"
                id="stand"
                label="Tilstand"
                value={form.stand}
                onChange={(event) => updateField("stand", event.target.value)}
                input={<OutlinedInput label="Tilstand" />}
              >
                <MenuItem value="" disabled>
                  Vaelg tilstand
                </MenuItem>
                {STAND_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </FormControl>

        <Button variant="outlined" component="label" fullWidth className="opret-image-button">
          Vaelg billede
          <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
        </Button>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          className="opret-submit-button"
          disabled={loading || !isProductFormComplete(form, imageFiles.length)}
        >
          {loading ? "Opretter..." : "Opret Produkt"}
        </Button>

        {message ? <Alert severity={message.type}>{message.text}</Alert> : null}
      </Box>
    </Box>
  )
}



