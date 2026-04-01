"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Box, Button, IconButton } from "@mui/material"
import FavoriteIcon from "@mui/icons-material/Favorite"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react"
import "./productEdit.css"

interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  user_id: string
  color?: string | null
  stand?: string | null
  size?: string | null
  sold: boolean | null
}

export default function ProductPage() {
  const params = useParams()
  const produktId = params.id as string | undefined
  const supabase = getSupabaseClient()

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewerId, setViewerId] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [slideX, setSlideX] = useState(0)

  const sliderRef = useRef<HTMLDivElement | null>(null)
  const maxSlideRef = useRef(0)
  const dragStartRef = useRef(0)
  const didDragRef = useRef(false)

  useEffect(() => {
    if (!produktId) {
      setError("Intet produkt id")
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const currentUserId = userData.user?.id ?? null
        setViewerId(currentUserId)

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", produktId)
          .single()

        if (error) throw new Error(error.message)
        setProduct(data)

        if (currentUserId) {
          const { data: favoriteData } = await supabase
            .from("favoriter")
            .select("product_id")
            .eq("user_id", currentUserId)
            .eq("product_id", produktId)
            .maybeSingle()

          setIsFavorite(Boolean(favoriteData))
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Fejl ved hentning"
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    
    load()
  }, [produktId, supabase])
  


  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/products/${produktId}`,
        queryParams: { prompt: 'select_account' }
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  const toggleSoldStatus = async () => {
    if (!product || viewerId !== product.user_id) {
      return
    }

    const nextSoldValue = !product.sold

    const { error } = await supabase
      .from("products")
      .update({ sold: nextSoldValue })
      .eq("id", produktId)
      .select()

    if (error) {
      setError("Kunne ikke opdatere produktstatus")
      return
    }

    setProduct({ ...product, sold: nextSoldValue })
  }

  const toggleFavorite = async () => {
    if (!product || !viewerId) {
      return
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favoriter")
        .delete()
        .eq("user_id", viewerId)
        .eq("product_id", product.id)

      if (error) {
        setError("Kunne ikke fjerne favorit")
        return
      }

      setIsFavorite(false)
      return
    }

    const { error } = await supabase
      .from("favoriter")
      .insert([{ user_id: viewerId, product_id: product.id }])

    if (error) {
      setError("Kunne ikke gemme favorit")
      return
    }

    setIsFavorite(true)
  }

  const onHeartPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!sliderRef.current || product?.sold) {
      return
    }

    const heartSize = 44
    maxSlideRef.current = Math.max(sliderRef.current.clientWidth - heartSize - 16, 0)
    dragStartRef.current = event.clientX - slideX
    didDragRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onHeartPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || product?.sold) {
      return
    }

    const nextX = Math.min(Math.max(event.clientX - dragStartRef.current, 0), maxSlideRef.current)
    if (Math.abs(nextX - slideX) > 4) {
      didDragRef.current = true
    }
    setSlideX(nextX)
  }

  const onHeartPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    // Slide is visual only for now and always resets on release.
    setSlideX(0)
  }

  const onFavoriteClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    toggleFavorite()
  }

  const isOwner = product ? viewerId === product.user_id : false
  const slideProgress = maxSlideRef.current > 0 ? slideX / maxSlideRef.current : 0
  const sliderStyle = {
    "--slide-progress": slideProgress,
  } as CSSProperties


  if (loading) return <p style={{ padding: 20 }}>Henter produkt...</p>
  if (error) return <p style={{ padding: 20 }}>{error}</p>
  if (!product) return <p style={{ padding: 20 }}>Produkt ikke fundet.</p>
  



  return (
    <Box className="product-page">
      <Box className="product-image-wrapper">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="product-image"
            />
          )}
      </Box>

      <Box className="product-details">
        <Box className="product-card">
          <Box className="product-card-content-top">
            <Box>
              <h1 className="product-title">{product.title}</h1>
              <p className="product-card-description">{product.description}</p>
            </Box>
            <Box>
              <p className="product-price">{product.price?.toFixed(2)} Kr.</p>
            </Box>
          </Box>
          <Box className="product-card-kategori">
            <p className="product-meta">{product.color}</p>
            <p className="product-meta">{product.stand}</p>
            {product.size && (
              <>
                <p className="product-meta">{product.size}</p>
              </>
            )}
          </Box>
        </Box>

        <Box className="product-cta-wrap">
          {isOwner ? (
            <Button
              onClick={toggleSoldStatus}
              className="product-action-button"
            >
              {product.sold ? "Markér som ledig igen" : "Markér som solgt"}
            </Button>
          ) : viewerId ? (
            <Box
              ref={sliderRef}
              className={`product-purchase-slider${product.sold ? " sold" : ""}${slideX > 0 ? " slide-active" : ""}`}
              style={sliderStyle}
            >
              <IconButton
                onClick={onFavoriteClick}
                onPointerDown={onHeartPointerDown}
                onPointerMove={onHeartPointerMove}
                onPointerUp={onHeartPointerUp}
                onPointerCancel={onHeartPointerUp}
                className={`product-favorite-button${isFavorite ? " active" : ""}`}
                aria-label={isFavorite ? "Fjern fra favoritter" : "Gem som favorit"}
                sx={{ transform: `translateX(${slideX}px)` }}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>

              {!product.sold && (
                <p className="product-slide-hint" aria-hidden>
                  Klar til næste runde <span>»»</span>
                </p>
              )}

              <p className="product-purchase-label">{product.sold ? "Solgt" : "Køb"}</p>
            </Box>
          ) : (
            <Button
              onClick={handleGoogleLogin}
              className="product-action-button"
            >
              Log ind for at gemme favorit
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}
