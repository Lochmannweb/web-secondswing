"use client"

import React, { useEffect, useState } from "react"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  IconButton,
  Alert,
  Box,
  Button,
} from "@mui/material"
import FavoriteIcon from '@mui/icons-material/Favorite'
import Link from "next/link"

interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
}

export default function Favoriter() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchFavoritesWithProducts = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setLoading(false)
        return
      }
      setUserId(userData.user.id)

      // Hent alle favoritter for brugeren
      const { data: favData, error: favError } = await supabase
        .from("favoriter")
        .select("product_id")
        .eq("user_id", userData.user.id)

      if (favError) {
        console.error("Fejl ved hentning af favoritter:", favError)
        setLoading(false)
        return
      }

      const productIds = favData.map(f => f.product_id)

      if (!productIds.length) {
        setProducts([])
        setLoading(false)
        return
      }

      // Hent tilhørende produkter
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)

      if (productError) console.error("Fejl ved hentning af produkter:", productError)
      else setProducts(productData)

      setLoading(false)
    }

    fetchFavoritesWithProducts()
  }, [supabase])

  const removeFavorite = async (productId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from("favoriter")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
      if (error) console.error("Fejl ved sletning:", error)
      else {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <Typography>Indlæser favoritter...</Typography>
  if (!products.length) return <Alert severity="info">Ingen favoritter endnu.</Alert>

  return (
    <>
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2, pt: "6rem" }}>
    <Typography variant="h5" sx={{ mb: 2, borderBottom: "1px solid white", color: "white" }}>Favorites</Typography>

    
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={product.id}>
          <Card sx={{ height: { xs: "50vh", sm: "45vh" }, position: "relative", backgroundColor: "transparent" }}>
            {product.image_url && (
              <CardMedia component="img" height="200" image={product.image_url} alt={product.title} />
            )}
            <CardContent sx={{ color: "white" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "18px" }} component="h2">
                  {product.title}
                </Typography>
              </Box>
              {/* Favorit-ikon til at fjerne */}
              <IconButton
                onClick={() => removeFavorite(product.id)}
                sx={{
                  position: "absolute",
                  top: "13rem",
                  right: 6,
                  color: "white",
                }}
              >
                <FavoriteIcon />
              </IconButton>
              {product.description && (
                <Typography variant="body2" sx={{ mb: 2, fontSize: "13px" }}>
                  {product.description}
                </Typography>
              )}
              {product.price && (
                <Typography
                  sx={{
                    borderRadius: "3rem",
                    fontSize: "0.8rem",
                    alignSelf: "end",
                    left: { xs: "-1rem", sm: "-3.5rem" },
                  }}
                >
                  {product.price.toFixed(2)} DKK
                </Typography>
              )}
            </CardContent>
            <Button
                  component={Link}
                  href={`/products/${product.id}`}
                  sx={{ 
                    width: "100%", 
                    position: "absolute",
                    border: "1px solid gray",
                    color: "white", 
                    display: "flex",
                    justifySelf: "center",
                    bottom: "1rem",
                    padding: "0.3rem 1rem",
                    fontSize: "10px",
                    "&:hover": {
                      backgroundColor: "darkGreen",
                      border: "1px solid darkGreen",
                      color: "white"
                    }
                  }}
                >
                  See More
            </Button>
          </Card>
        </Grid>
      ))}
    </Grid>
    </Box>
    </>
  )
}
