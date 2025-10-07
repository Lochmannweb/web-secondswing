"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  Box, 
  Button,
  Alert, 
  IconButton
} from "@mui/material"
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { supabase } from "@/lib/supabaseClient"

interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
  user_id: string
  gender?: "male" | "female" | "unisex" | null
}

interface AllProductsProps {
  products: Product[]
}

export default function AllProducts({ products }: AllProductsProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)

useEffect(() => {
  const fetchFavorites = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    setUserId(userData.user.id)

    const { data: favData, error } = await supabase
      .from("favoriter")
      .select("product_id")
      .eq("user_id", userData.user.id)

    if (error) console.error(error)
    else setFavorites(favData.map(f => f.product_id))
  }
  fetchFavorites()
}, [])

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
    return <Alert severity="info">Der er ingen produkter tilgængelige i øjeblikket.</Alert>
  }

  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={product.id}>
          <Card sx={{ height: "100%" }}>
            {product.image_url && (
              <CardMedia component="img" height="200" image={product.image_url} alt={product.title} />
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              {product.price && (
                <Typography
                  sx={{
                    backgroundColor: "#e2ffd7",
                    borderRadius: "3rem",
                    fontSize: "0.8rem",
                    width: "70%",
                    textAlign: "center",
                    alignSelf: "end",
                    color: "black",
                    position: "relative",
                    top: "-12rem",
                    padding: "0 1rem",
                    right: "0.5rem",
                  }}
                >
                  {product.price.toFixed(2)} DKK
                </Typography>
              )}
              <IconButton
                onClick={() => toggleFavorite(product.id)}
                sx={{ 
                  color: favorites.includes(product.id) ? 'white' : 'white',   
                  top: "-11.5rem", }}>
                {favorites.includes(product.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
            <CardContent>
              <Box 
                sx={{ 
                  marginTop: "-3rem" 
                }}>
                <Typography sx={{ fontSize: "15px" }} component="h2">
                  {product.title}
                </Typography>
              </Box>
              {product.description && (
                <Typography variant="body2" sx={{ mb: 2, fontSize: "13px" }}>
                  {product.description}
                </Typography>
              )}
            </CardContent>
            <Button
                  component={Link}
                  href={`/products/${product.id}`}
                  sx={{
                    fontSize: "10px",
                    border: "1px solid grey",
                    borderRadius: "0.5rem",
                    width: "90%",
                    color: "black",
                    display: "flex",
                    marginBottom: "0.5rem",
                    justifySelf: "center",
                    padding: "0.3rem 1rem",
                    background:"#e2ffd7",
                    "&:hover": { backgroundColor: "#60954d", color: "white" },
                  }}
                >
                  See More
            </Button>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
