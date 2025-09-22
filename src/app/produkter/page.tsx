"use client"

import { getSupabase } from "@/lib/supabaseClient"
import { Box, Typography, Card, CardContent, CardMedia, Alert, CircularProgress, Grid, Divider, Button, IconButton } from "@mui/material"
import Link from "next/link"
import { useState, useEffect } from "react"


interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
}

export default function ProdukterPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const supabase = getSupabase()

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          setError("Du skal være logget ind for at se dine produkter")
          return
        }

        setUser(user)

        const { data: userProducts, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (productsError) {
          throw new Error(`Kunne ikke hente produkter: ${productsError.message}`)
        }

        setProducts(userProducts || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Der opstod en fejl ved hentning af produkter")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProducts()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ padding: "1rem", color: "black", }}>
      <Typography sx={{ fontSize: "1.2rem" }}>Mine produkter</Typography>
      <Divider sx={{ mb: "3rem", backgroundColor: "black", width: "30%" }} />
      {products.length === 0 ? (
        <Alert severity="info">Du har ikke oprettet nogen produkter endnu.</Alert>
      ) : (
        <>
          <Grid container spacing={1} sx={{ justifySelf: "start" }}>
            {products.map((product) => (
              <Grid key={product.id} size={{ xs: 6, sm: 6, md: 4 }}>
                <Card sx={{ color: "black", height: "100%" }}>
                  {product.image_url && (
                    <CardMedia component="img" height="200" image={product.image_url} alt={product.title} />
                  )}
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    {product.price && (
                      <Typography
                        sx={{
                          backgroundColor: "white",
                          borderRadius: "3rem",
                          fontSize: "0.8rem",
                          width: "40%",
                          textAlign: "center",
                          alignSelf: "end",
                          color: "black",
                          position: "relative",
                          top: "-12rem",
                          right: "0.5rem",
                        }}
                      >
                        {product.price.toFixed(2)} DKK
                      </Typography>
                    )}
                  </Box>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "-1rem" }}>
                      <Typography sx={{ fontSize: "18px" }} component="h2">
                        {product.title}
                      </Typography>
                    </Box>
                    {product.description && (
                      <Typography variant="body2" sx={{ mb: 2, fontSize: "13px" }}>
                        {product.description}
                      </Typography>
                    )}
                    <Button 
                      component={Link}
                      href={`/edit/${product.id}`}
                      sx={{ 
                        display: "flex", 
                        justifySelf: "end", 
                        fontSize: "0.7rem",
                        color: "black",
                        border: "1px solid gray",
                        padding: "0 1rem"
                      }}>
                      Ændre
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  )
}
