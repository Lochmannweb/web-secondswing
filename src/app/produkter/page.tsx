"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Box, Typography, Card, CardContent, CardMedia, Alert, CircularProgress, Grid, Divider, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import Link from "next/link"
import { useState, useEffect } from "react"
import { deleteProduct } from "../lib/crud"


interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
  sold: boolean | null;
}

export default function ProdukterPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
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

      // Fjern produktet fra browser uden reload
      setProducts((prev) => prev.filter((p) => p.id !== selectedProductId));
      setOpenDialog(false);
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
    <Box className="produkter-container">
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

      <Typography variant="overline" className="shop-page-kicker">
        Alle Produkter
      </Typography>
      <Divider className="produkter-divider" />
      {products.length === 0 ? (
        <Alert severity="info">Du har ikke oprettet nogen produkter endnu.</Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid key={product.id} size={{ xs: 6, sm: 6, md: 3 }}>
                <Card className="produkter-card">
                  {product.image_url && (
                    <Box>
                      {product.sold && (
                      <Box className="shop-soldout">
                          <p>Solgt</p>
                      </Box>
                      )}
                      <CardMedia component="img" height="200" image={product.image_url} alt={product.title} />
                    </Box>
                  )}

                  <CardContent className="produkter-card-content">
                    <Typography className="produkter-card-title" component="h2">{product.title}</Typography>
                    <Typography variant="body2" className="produkter-card-desc">{product.description}</Typography>
                    <Typography className="produkter-card-price">{product.price} DKK</Typography>

                    <Button 
                      component={Link}
                      href={`/edit/${product.id}`}
                      className="produkter-action-button">
                      Rediger
                    </Button>

                    <Button 
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setOpenDialog(true);
                      }}
                      className="produkter-action-button">
                      Slet
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
