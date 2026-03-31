"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Box, Button, Typography } from "@mui/material"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

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

  const isOwner = product ? viewerId === product.user_id : false


  if (loading) return <p style={{ padding: 20 }}>Henter produkt...</p>
  if (error) return <p style={{ padding: 20 }}>{error}</p>
  if (!product) return <p style={{ padding: 20 }}>Produkt ikke fundet.</p>
  



  return (
    <Box display={{ xs: "grid", sm: "flex" }} justifyContent={{ sm: "center" }} gap={{ sm: "2rem" }} pt={{ xs: "8rem" }} p={2} height={{ sm: "90vh" }} mb={{ xs: "2rem" }}>
      <Box alignSelf={{ sm: "center" }} mb={{ xs: "1rem" }} sx={{ position: "relative" }}>  
          {product.image_url && (
            <Image
              src={product.image_url} 
              alt={product.title}
              width={500}
              height={100}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "0.3rem",
              }}        
            />
          )}

          {product.sold && (
      <Box className="shop-soldout">
        <p>Solgt</p>
          </Box>
          )}
      </Box>

      <Box alignSelf={{ sm: "center" }} width={{ sm: "50vh" }}>
        <Box
          sx={{
            color: "white",
            backgroundColor: "#1a1a1aff",
            padding: "1rem",
            borderRadius: "0.3rem",
            mb: 2,
            width: { sm: "100%" }
          }}
        >
          <h1 style={{ fontSize: "1rem" }}>{product.title}</h1>
          <p style={{ color: "gray" }}>{product.color} - {product.stand}{product.size ? ` - ${product.size}` : ""}</p>
          <p style={{ color: "gray", marginTop: "1rem" }}>{product.price?.toFixed(2)} Kr.</p>
        </Box>

        <Box
          sx={{
            color: "gray",
            backgroundColor: "#1a1a1aff",
            padding: "1rem",
            borderRadius: "0.3rem",
            width: { sm: "100%" },
            display: "grid",
            mb: 2,
            gap: "2rem",
          }}
        >
          <p>Beskrivelse</p>
          <p>{product.description}</p>
        </Box>

        <Box
          sx={{
            color: "gray",
            backgroundColor: "#1a1a1aff",
            padding: "1rem",
            borderRadius: "0.3rem",
            width: { sm: "100%" },
            display: "grid",
            gap: "0.5rem"
          }}
        >
          <p style={{ color: "white" }}>Handel direkte mellem brugere</p>
          <p>Second Swing håndterer ikke betaling endnu. Brug siden til at opdage produkter og gem favoritter.</p>
        </Box>

        {isOwner ? (
          <Button
            onClick={toggleSoldStatus}
            sx={{
              width: "100%",
              backgroundColor: "transparent",
              border: "1px solid grey",
              color: "white",
              top: "1rem",
              position: "relative",
              "&:hover": { backgroundColor: "darkGreen", color: "white", border: "1px solid darkGreen" },
            }}
          >
            {product.sold ? "Markér som ledig igen" : "Markér som solgt"}
          </Button>
        ) : viewerId ? (
          <Button
            onClick={toggleFavorite}
            disabled={Boolean(product.sold)}
            sx={{
              width: "100%",
              backgroundColor: "transparent",
              border: "1px solid grey",
              color: "white",
              top: "1rem",
              position: "relative",
              "&:hover": { backgroundColor: product.sold ? "transparent" : "darkGreen", color: "white", border: product.sold ? "1px solid gray" : "1px solid darkGreen" },
            }}
          >
            {product.sold ? "Solgt" : isFavorite ? "Fjern fra favoritter" : "Gem som favorit"}
          </Button>
        ) : (
          <Button
            onClick={handleGoogleLogin}
            sx={{
              width: "100%",
              backgroundColor: "transparent",
              border: "1px solid grey",
              color: "white",
              top: "1rem",
              position: "relative",
              "&:hover": { backgroundColor: "darkGreen", color: "white", border: "1px solid darkGreen" },
            }}
          >
            Log ind for at gemme favorit
          </Button>
        )}
      </Box>
    </Box>
  )
}
