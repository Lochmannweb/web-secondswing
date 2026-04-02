"use client"

import { deleteProduct, updateProduct } from "@/app/lib/crud"
import {
  buildProductPayload,
  CATEGORY_OPTIONS,
  getCategoryFields,
  getRequiredProductFields,
  ProductFieldDefinition,
  ProductFormState,
  STAND_OPTIONS,
  toProductFormState,
} from "@/app/lib/productForm"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
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
import "./editProdukt.css"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string | undefined
  const supabase = getSupabaseClient()

  const [form, setForm] = useState<ProductFormState>(() => toProductFormState({}))
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>([])
  const [productImages, setProductImages] = useState<string[]>([])
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const useNativeSelect = useMemo(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia("(hover: none), (pointer: coarse)").matches
  }, [])

  const updateField = (key: keyof ProductFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedImagePreviews])

  useEffect(() => {
    if (!productId) {
      setMessage({ type: "error", text: "Produkt-id mangler." })
      setAuthChecked(true)
      return
    }

    const load = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setMessage({ type: "error", text: "Du skal vaere logget ind for at redigere produkter." })
          setAuthChecked(true)
          return
        }

        const { data: product, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single()

        if (error) {
          throw new Error(error.message)
        }

        if (!product) {
          setMessage({ type: "error", text: "Produkt ikke fundet." })
          setAuthChecked(true)
          return
        }

        if (product.user_id !== session.user.id) {
          setMessage({ type: "error", text: "Du ejer ikke dette produkt." })
          setAuthChecked(true)
          return
        }

        setIsOwner(true)
        setForm(toProductFormState(product))

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
          ? [...initialImages, ...extraImages.map((item) => item.image_url).filter(Boolean)]
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
  }, [productId, supabase])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    selectedImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    setImageFiles(files)
    setSelectedImagePreviews(files.map((file) => URL.createObjectURL(file)))
    setActivePreviewIndex(0)
    event.target.value = ""
  }

  const uploadImage = async (file: File, userId: string, index: number): Promise<string> => {
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase()
    const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const filePath = `${userId}/${productId ?? "tmp"}-${Date.now()}-${index}-${uniqueId}.${fileExt}`

    const { error } = await supabase.storage.from("avatars").upload(filePath, file)

    if (error) {
      throw new Error(`Kunne ikke uploade billede: ${error.message}`)
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
    return data.publicUrl
  }

  const displayImages = useMemo(() => {
    if (selectedImagePreviews.length > 0) {
      return selectedImagePreviews
    }

    if (productImages.length > 0) {
      return productImages
    }

    return ["/darkimgplaceholder.jpg"]
  }, [productImages, selectedImagePreviews])

  const categoryFields = getCategoryFields(form.category)
  const canSubmit = getRequiredProductFields(form.category).every((fieldKey) => {
    const value = form[fieldKey]
    return typeof value === "string" && value.trim().length > 0
  }) && Number(form.price) > 0 && displayImages.length > 0

  const renderField = (field: ProductFieldDefinition) => {
    if (field.kind === "select" && field.options) {
      if (useNativeSelect) {
        return (
          <FormControl key={field.key} fullWidth required className="edit-select-field">
            <InputLabel shrink htmlFor={`edit-${field.key}-native`}>
              {field.label}
            </InputLabel>
            <Select
              native
              id={`edit-${field.key}-native`}
              value={form[field.key]}
              onChange={(event) => updateField(field.key, event.target.value)}
              input={<OutlinedInput notched label={field.label} />}
            >
              <option value="" disabled>
                Vælg {field.label.toLowerCase()}
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
        <FormControl key={field.key} fullWidth required className="edit-select-field">
          <InputLabel id={`edit-${field.key}-label`}>{field.label}</InputLabel>
          <Select
            labelId={`edit-${field.key}-label`}
            id={`edit-${field.key}`}
            label={field.label}
            value={form[field.key]}
            onChange={(event) => updateField(field.key, event.target.value)}
            input={<OutlinedInput label={field.label} />}
          >
            <MenuItem value="" disabled>
              Vælg {field.label.toLowerCase()}
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
        className="edit-input-field"
      />
    )
  }

  const goToPreviousPreview = () => {
    setActivePreviewIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const goToNextPreview = () => {
    setActivePreviewIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!productId) {
      return
    }

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
        throw new Error("Du skal vaere logget ind for at redigere produkter.")
      }

      let imageUrl = form.image_url ?? null
      let uploadedUrls: string[] = []

      if (imageFiles.length > 0) {
        uploadedUrls = await Promise.all(imageFiles.map((file, index) => uploadImage(file, user.id, index)))
        imageUrl = uploadedUrls[0] ?? null
      }

      const productPayload = buildProductPayload(form)

      if (!productPayload.category) {
        throw new Error("Vælg en kategori for produktet.")
      }

      if (productPayload.price === null || Number.isNaN(productPayload.price) || productPayload.price <= 0) {
        throw new Error("Indtast en gyldig pris større end 0.")
      }

      await updateProduct(productId, {
        ...productPayload,
        image_url: imageUrl,
      })

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
    if (!productId) {
      return
    }

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

  return (
    <Box component="form" onSubmit={handleSubmit} className="edit-form">
      <Box className="edit-image-wrap">
        <Box className="edit-image-stage">
          <Box className="edit-image-track" sx={{ transform: `translateX(-${activePreviewIndex * 100}%)` }}>
            {displayImages.map((imageSrc, index) => (
              <Box key={`${imageSrc}-${index}`} className="edit-image-slide">
                <Image src={imageSrc} alt={`Produkt preview ${index + 1}`} fill className="edit-image" />
              </Box>
            ))}
          </Box>

          {displayImages.length > 1 ? (
            <>
              <IconButton onClick={goToPreviousPreview} className="edit-image-nav edit-image-nav-prev" aria-label="Forrige billede">
                <NavigateBeforeIcon />
              </IconButton>
              <IconButton onClick={goToNextPreview} className="edit-image-nav edit-image-nav-next" aria-label="Naeste billede">
                <NavigateNextIcon />
              </IconButton>
            </>
          ) : null}
        </Box>

        {displayImages.length > 1 ? (
          <Box className="edit-image-dots">
            {displayImages.map((_, index) => (
              <span
                key={`edit-preview-dot-${index}`}
                className={`edit-image-dot${index === activePreviewIndex ? " active" : ""}`}
              />
            ))}
          </Box>
        ) : null}
      </Box>

      <Box className="edit-fields">
        <FormControl fullWidth required className="edit-select-field">
          {useNativeSelect ? (
            <>
              <InputLabel shrink htmlFor="edit-category-native">
                Kategori
              </InputLabel>
              <Select
                native
                id="edit-category-native"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                input={<OutlinedInput notched label="Kategori" />}
              >
                <option value="" disabled>
                  Vælg kategori
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
              <InputLabel id="edit-category-label">Kategori</InputLabel>
              <Select
                labelId="edit-category-label"
                id="edit-category"
                label="Kategori"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                input={<OutlinedInput label="Kategori" />}
              >
                <MenuItem value="" disabled>
                  Vælg kategori
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
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          required
          fullWidth
          className="edit-input-field"
        />

        <TextField
          label="Beskrivelse"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          required
          fullWidth
          multiline
          rows={4}
          className="edit-input-field"
        />

        <TextField
          label="Pris (DKK)"
          type="number"
          value={form.price}
          onChange={(event) => updateField("price", event.target.value)}
          required
          fullWidth
          className="edit-input-field"
        />

        {categoryFields.map(renderField)}

        <FormControl fullWidth required className="edit-select-field">
          {useNativeSelect ? (
            <>
              <InputLabel shrink htmlFor="edit-stand-native">
                Tilstand
              </InputLabel>
              <Select
                native
                id="edit-stand-native"
                value={form.stand}
                onChange={(event) => updateField("stand", event.target.value)}
                input={<OutlinedInput notched label="Tilstand" />}
              >
                <option value="" disabled>
                  Vælg tilstand
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
              <InputLabel id="edit-stand-label">Tilstand</InputLabel>
              <Select
                labelId="edit-stand-label"
                id="edit-stand"
                label="Tilstand"
                value={form.stand}
                onChange={(event) => updateField("stand", event.target.value)}
                input={<OutlinedInput label="Tilstand" />}
              >
                <MenuItem value="" disabled>
                  Vælg tilstand
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

        <Button variant="outlined" component="label" fullWidth className="edit-image-button">
          Skift billeder
          <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
        </Button>

        <Button type="submit" fullWidth disabled={loading || !canSubmit} className="edit-submit-button">
          {loading ? "Opdaterer..." : "Gem aendringer"}
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
            <p className="edit-delete-confirm-text">Er du sikker paa, at du vil slette produktet?</p>
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
                Bekraeft sletning
              </Button>
            </Box>
          </Box>
        )}

        {message ? <Alert severity={message.type} className="edit-alert">{message.text}</Alert> : null}
      </Box>
    </Box>
  )
}
