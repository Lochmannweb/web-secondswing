"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Typography, 
  Card, 
  CardMedia, 
  Grid, 
  Alert, 
  IconButton,
  Box
} from "@mui/material"
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { getSupabaseClient } from "@/app/lib/supabaseClient"

interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
  user_id: string
  gender?: "male" | "female" | "unisex" | null
  sold: boolean | null;
}

interface AllProductsProps {
  products: Product[]
}

export default function AllProducts({ products }: AllProductsProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = getSupabaseClient()




useEffect(() => {
  const fetchFavorites = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setUserId(null)
      setFavorites([])
      return
    }
    setUserId(userData.user.id)

    const { data: favData, error } = await supabase
      .from("favoriter")
      .select("product_id")
      .eq("user_id", userData.user.id)

    if (error) console.error(error)
    else setFavorites(favData.map(f => f.product_id))
  }
  fetchFavorites()
}, [supabase])




const toggleFavorite = async (productId: string) => {
  if (!userId) return

  try {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId))
      const { error } = await supabase
        .from("favoriter")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
      if (error) console.error("Fejl ved sletning:", error)
    } else {
      setFavorites([...favorites, productId])
      const { error } = await supabase
        .from("favoriter")
        .insert([{ user_id: userId, product_id: productId }])
      if (error) console.error("Fejl ved indsættelse:", error)
    }
  } catch (err) {
    console.error(err)
  }
}





  if (!products || products.length === 0) {
    return <Alert severity="info">Ingen produkter matcher din søgning endnu.</Alert>
  }




  return (
    <Grid container spacing={2} className="shop-product-grid">
      {products.map((product) => (
        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={product.id} className="shop-product-grid-item">
          <Card className="shop-product-card">
            <Box className="shop-product-media-wrap">
              {product.sold && (
              <Box className="shop-soldout">
                  <p>Solgt</p>
              </Box>
              )}
              {userId && (
                <IconButton
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    toggleFavorite(product.id)
                  }}
                  className="shop-favorite-button"
                >
                  {favorites.includes(product.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              )}
              <Link href={`/products/${product.id}`} className="shop-product-hitarea" aria-label={`Gå til ${product.title}`}>
                {product.image_url && (
                  <CardMedia component="img" image={product.image_url} alt={product.title} className="shop-product-image" />
                )}

                <Box className="shop-product-overlay">
                  <Typography component="h2" className="shop-product-title">
                    {product.title}
                  </Typography>
                  {product.description && (
                    <Typography variant="body2" className="shop-product-description">
                      {product.description}
                    </Typography>
                  )}
                  {product.price && (
                    <Typography className="shop-product-price">
                      {product.price.toFixed(2)} DKK
                    </Typography>
                  )}
                </Box>
              </Link>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
