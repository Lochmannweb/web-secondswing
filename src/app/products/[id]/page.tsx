"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { getProductDetailMeta } from "@/app/lib/productDisplay"
import { Box, Button, IconButton } from "@mui/material"
import FavoriteIcon from "@mui/icons-material/Favorite"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type TouchEvent } from "react"
import "./productEdit.css"

interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  user_id: string
  color?: string | null
  category?: string | null
  gender?: string | null
  stand?: string | null
  size?: string | null
  brand?: string | null
  club_type?: string | null
  flex?: string | null
  hand?: string | null
  divider_count?: number | null
  weight?: string | null
  sold: boolean | null
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const produktId = params.id as string | undefined
  const supabase = getSupabaseClient()

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewerId, setViewerId] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [slideX, setSlideX] = useState(0)
  const [productImages, setProductImages] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const sliderRef = useRef<HTMLDivElement | null>(null)
  const maxSlideRef = useRef(0)
  const dragStartRef = useRef(0)
  const didDragRef = useRef(false)
  const imageSwipeStartXRef = useRef<number | null>(null)
  const imagePointerIdRef = useRef<number | null>(null)

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

        const initialImages = data.image_url ? [data.image_url] : []
        setProductImages(initialImages)

        const { data: extraImages, error: extraImagesError } = await supabase
          .from("product_images")
          .select("image_url, position")
          .eq("product_id", produktId)
          .order("position", { ascending: true })

        if (!extraImagesError && extraImages) {
          const mergedImages = [
            ...initialImages,
            ...extraImages.map((item) => item.image_url).filter(Boolean),
          ]

          // Remove duplicates while preserving order
          setProductImages(Array.from(new Set(mergedImages)))
        }

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

  const openOrCreateChat = async () => {
    if (!viewerId) {
      await handleGoogleLogin()
      return
    }

    if (!product || viewerId === product.user_id) {
      return
    }

    setIsCreatingChat(true)

    try {
      const { data: existingChats, error: existingError } = await supabase
        .from("chats")
        .select("id")
        .or(`and(buyer_id.eq.${viewerId},seller_id.eq.${product.user_id}),and(buyer_id.eq.${product.user_id},seller_id.eq.${viewerId})`)
        .limit(1)

      if (existingError) {
        throw new Error(existingError.message)
      }

      const existingChatId = existingChats?.[0]?.id
      if (existingChatId) {
        router.push(`/chats?chatId=${existingChatId}`)
        return
      }

      const { data: insertedChat, error: insertError } = await supabase
        .from("chats")
        .insert([{ buyer_id: viewerId, seller_id: product.user_id }])
        .select("id")
        .single()

      if (insertError || !insertedChat?.id) {
        throw new Error(insertError?.message ?? "Kunne ikke oprette samtale")
      }

      router.push(`/chats?chatId=${insertedChat.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kunne ikke starte samtale"
      setError(msg)
    } finally {
      setIsCreatingChat(false)
    }
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

  const handleImageSwipe = (startX: number, endX: number) => {
    if (productImages.length < 2) {
      return
    }

    const deltaX = endX - startX
    if (Math.abs(deltaX) < 45) {
      return
    }

    if (deltaX < 0) {
      setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
    } else {
      setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
    }
  }

  const onImagePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (productImages.length < 2 || event.pointerType !== "mouse") {
      return
    }

    // Don't capture pointer when clicking navigation buttons
    if ((event.target as HTMLElement).closest("button")) {
      return
    }

    imageSwipeStartXRef.current = event.clientX
    imagePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onImagePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (imageSwipeStartXRef.current === null || imagePointerIdRef.current !== event.pointerId) {
      return
    }

    handleImageSwipe(imageSwipeStartXRef.current, event.clientX)
    imageSwipeStartXRef.current = null
    imagePointerIdRef.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onImageTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (productImages.length < 2) {
      return
    }

    imageSwipeStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const onImageTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (imageSwipeStartXRef.current === null || productImages.length < 2) {
      return
    }

    const endX = event.changedTouches[0]?.clientX
    if (typeof endX !== "number") {
      imageSwipeStartXRef.current = null
      return
    }

    handleImageSwipe(imageSwipeStartXRef.current, endX)
    imageSwipeStartXRef.current = null
  }

  const resetImageSwipe = () => {
    imageSwipeStartXRef.current = null
    imagePointerIdRef.current = null
  }

  const isOwner = product ? viewerId === product.user_id : false
  const detailMeta = product ? getProductDetailMeta(product) : []
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
        {productImages.length > 0 && (
          <Box className="product-image-slider">
            <Box
              className="product-image-track"
              sx={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
            >
              {productImages.map((imageUrl, index) => (
                <Box key={`${imageUrl}-${index}`} className="product-image-slide">
                  <Image
                    src={imageUrl}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="product-image"
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Box
        className="product-scroll-spacer"
        onPointerDown={onImagePointerDown}
        onPointerUp={onImagePointerUp}
        onPointerCancel={resetImageSwipe}
        onTouchStart={onImageTouchStart}
        onTouchEnd={onImageTouchEnd}
        onTouchCancel={resetImageSwipe}
      >
        {productImages.length > 1 && (
          <>
            {/* <Button
              className="product-image-nav prev"
              onClick={() => setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
            >
              ←
            </Button>
            <Button
              className="product-image-nav next"
              onClick={() => setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
            >
              →
            </Button> */}
            <Box className="product-top-dots">
              {productImages.map((_, index) => (
                <span
                  key={`product-image-dot-${index}`}
                  className={`product-image-dot${index === activeImageIndex ? " active" : ""}`}
                />
              ))}
            </Box>
          </>
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
            {detailMeta.map((meta) => (
              <p key={meta.key} className="product-meta">{meta.value}</p>
            ))}
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
          ) : (
            <>
              <Button
                onClick={openOrCreateChat}
                className="product-action-button product-chat-button"
                disabled={isCreatingChat}
              >
                {viewerId ? (isCreatingChat ? "Åbner chat..." : "Skriv til sælger") : "Log ind for at skrive til sælger"}
              </Button>

              {viewerId ? (
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
                      Klar til et Second Swing! <span>»»</span>
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
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}
