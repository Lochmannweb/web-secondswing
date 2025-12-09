"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Box, Typography, Card, CardContent, CardMedia, Alert, CircularProgress, Grid, Divider, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import Link from "next/link"
import { useState, useEffect } from "react"


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

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", selectedProductId)
      .single();
      
      if(error) {
        alert("Kunne ikke slette produktet");
        return;
      }

      // Fjern produktet fra browser uden reload
      setProducts((prev) => prev.filter((p) => p.id !== selectedProductId));
      setOpenDialog(false);
  }




  // error / loading 

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", pt: "5rem" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box  sx={{ maxWidth: 1200, mx: "auto", p: 2, pt: "6rem", color: "white" }}>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        sx={{
          backgroundColor: "#0000006f",
          
          "& .MuiPaper-root": {
            backgroundColor: "#121212ff",
            color: "white",
          }
        }}
      >
        <DialogTitle color={"gray"}>Bekræft</DialogTitle>
        <DialogContent
        >
          <Typography>
            Er du sikker på, at du vil slette produktet?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "center" }}>
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

      <Typography sx={{ fontSize: "1.2rem" }}>Mine produkter</Typography>
      <Divider sx={{ mb: "3rem", backgroundColor: "white" }} />
      {products.length === 0 ? (
        <Alert severity="info">Du har ikke oprettet nogen produkter endnu.</Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid key={product.id} size={{ xs: 6, sm: 6, md: 3 }}>
                <Card sx={{ backgroundColor: "transparent", height: "100%", width: "100%" }}>
                  {product.image_url && (
                    <Box>
                      {product.sold && (
                      <Box position={"fixed"} p={2} sx={{ backgroundColor: "#000000c9", color: "white" }} width={"auto"}>
                          <Typography textTransform={"uppercase"} alignSelf={"center"} justifySelf={"center"}>Solgt</Typography>
                      </Box>
                      )}
                      <CardMedia component="img" height="200" image={product.image_url} alt={product.title} />
                    </Box>
                  )}

                  <CardContent sx={{ color: "white", height: "25vh" }}>
                    <Typography sx={{ fontSize: "18px" }} component="h2">{product.title}</Typography>
                    <Typography variant="body2" sx={{ mb: 2, fontSize: "12px", color: "gray" }}>{product.description}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "gray" }}>{product.price} DKK</Typography>

                    <Button 
                      component={Link}
                      href={`/edit/${product.id}`}
                      sx={{ 
                        width: "100%",
                        fontSize: "0.7rem",
                        color: "white",
                        border: "1px solid gray",
                        padding: "0 1rem",
                        marginTop: "1rem",
                        "&:hover": {
                          backgroundColor: "black",
                          border: "1px solid darkGreen",
                          color: "darkGreen"
                        }
                      }}>
                      Rediger
                    </Button>

                    <Button 
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setOpenDialog(true);
                      }}
                      sx={{ 
                        width: "100%",
                        fontSize: "0.7rem",
                        color: "white",
                        border: "1px solid gray",
                        padding: "0 1rem",
                        marginTop: "1rem",
                        "&:hover": {
                          backgroundColor: "black",
                          border: "1px solid darkGreen",
                          color: "darkGreen"
                        }
                      }}>
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
