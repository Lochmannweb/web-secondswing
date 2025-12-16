"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  Button,
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





  // if (!products || products.length === 0) {
  //   return <Alert severity="info">Der er ingen produkter tilgængelige i øjeblikket.</Alert>
  // }

  if (!userId) {
    return <Alert severity="info">Du skal være logget ind for at kunne se produkter</Alert>
  }




  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={product.id}>
          <Card sx={{ height: "60vh", backgroundColor: "transparent" }}>
            {product.image_url && (
              <Box>
                {product.sold && (
                <Box position={"absolute"} p={2} sx={{ backgroundColor: "#000000c9", color: "white" }} width={"auto"}>
                    <Typography textTransform={"uppercase"} alignSelf={"center"} justifySelf={"center"}>Solgt</Typography>
                </Box>
                )}
                <CardMedia component="img" height="200" image={product.image_url} alt={product.title} />
              </Box>
            )}
            <CardContent sx={{ color: "white" }}>
                <Typography sx={{ fontSize: "15px" }} component="h2">
                  {product.title}
                </Typography>
                {product.description && (
                  <Typography variant="body2">
                    {product.description}
                  </Typography>
                )}
                <IconButton
                  onClick={() => toggleFavorite(product.id)}
                  sx={{ 
                    color: favorites.includes(product.id) ? 'white' : 'white', 
                    left: { xs: "10rem", sm: "14rem" }, 
                    position: "relative",  
                    top: "-3rem", 
                  }}
                    >
                  {favorites.includes(product.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                {product.price && (
                  <Typography
                    sx={{
                      color: "white",
                      paddingTop: "1rem",
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
                    fontSize: "10px",
                    border: "1px solid grey",
                    borderRadius: "0.5rem",
                    width: "100%",
                    color: "white",
                    display: "flex",
                    justifySelf: "center",
                    padding: "0.3rem 1rem",
                    // background:"#e2ffd7",
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
