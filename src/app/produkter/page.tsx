"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Box, Typography, Card, CardContent, CardMedia, Alert, CircularProgress, Grid, Divider, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import Link from "next/link"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { deleteProduct } from "../lib/crud"
import "../components/Products/allProducts.css"


interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
  category?: string | null
  gender?: string | null
  color?: string | null
  size?: string | null
  stand?: string | null
  brand?: string | null
  club_type?: string | null
  flex?: string | null
  hand?: string | null
  divider_count?: number | null
  weight?: string | null
  sold: boolean | null;
}

export default function ProdukterPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);





  useEffect(() => {
    const fetchUserProducts = async () => {
      try {

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          setError("Du skal være logget ind for at se dine produkter")
          return
        }

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
  }, [supabase])


  // slet af produkt
  const deleteProdukt = async () => {
    if (!selectedProductId) return;

    try {
      await deleteProduct(selectedProductId);
    
      // Opdater UI
      setProducts((prev) =>
        prev.filter((p) => p.id !== selectedProductId)
      );
    
      setOpenDialog(false);
    } catch (error) {
      alert("Kunne ikke slette produktet");
    }
  }

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.push("/profile")
  }




  // error / loading 

  if (loading) {
    return (
      <Box className="produkter-loading">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box className="produkter-error">
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box className="produkter-page">
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        className="produkter-dialog"
      >
        <DialogTitle color={"gray"}>Bekræft</DialogTitle>
        <DialogContent
        >
          <Typography>
            Er du sikker på, at du vil slette produktet?
          </Typography>
        </DialogContent>
        <DialogActions className="produkter-dialog-actions">
          <Button 
            fullWidth
            onClick={() => setOpenDialog(false)}
            >
              Fortryd
          </Button>
          <Button 
            fullWidth
            onClick={deleteProdukt} 
            color="error" 
            variant="contained"
          >
            Slet
          </Button>
        </DialogActions>
      </Dialog>

      <Box className="produkter-page-layout">
        <Box className="produkter-page-sidebar">
          <Box className="produkter-back-row">
            <Button
              className="produkter-back-button"
              onClick={handleBack}
            >
              <NavigateBeforeIcon />
            </Button>
            <Typography variant="overline" className="produkter-page-kicker">
              Alle produkter
            </Typography>
          </Box>

          <Box className="produkter-page-header">
            <Typography variant="h3" className="produkter-page-title">
              Dine opslag samlet i samme overblik.
            </Typography>
            <Typography className="produkter-page-description">
              Rediger eller slet dine produkter fra et enkelt sted, med samme layout som shoppen.
            </Typography>
          </Box>

          <Box className="produkter-side-card">
            <Typography variant="overline" className="produkter-side-label">
              Status
            </Typography>
            <Typography className="produkter-side-value">
              {products.length} aktive produkter
            </Typography>
          </Box>
        </Box>

        <Box className="produkter-page-products">
          {products.length === 0 ? (
            <Alert severity="info">Du har ikke oprettet nogen produkter endnu.</Alert>
          ) : (
            <Grid container spacing={2} className="produkter-grid">
              {products.map((product) => {
                return (
                <Grid key={product.id} size={{ xs: 6, sm: 6, md: 3 }} className="produkter-grid-item">
                  <Card className="produkter-card">
                    <Box className="produkter-card-media-wrap">
                      {product.sold && (
                        <Box className="shop-soldout">
                          <p>Solgt</p>
                        </Box>
                      )}
                      {product.image_url && (
                        <CardMedia component="img" image={product.image_url} alt={product.title} className="produkter-card-image" />
                      )}
                      <Box className="produkter-card-overlay">
                        <Typography className="produkter-card-title" component="h2">{product.title}</Typography>
                        {product.price !== null && (
                          <Typography className="produkter-card-price">{product.price.toFixed(2)} DKK</Typography>
                        )}
                        <Box className="produkter-actions">
                          <Button
                            component={Link}
                            href={`/edit/${product.id}`}
                            className="produkter-action-button">
                            Rediger
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
                )
              })}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  )
}
