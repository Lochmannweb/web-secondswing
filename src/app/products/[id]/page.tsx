"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Box, Button, Typography } from "@mui/material"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"


export default function ProductPage() {
  const params = useParams()
  const produktId = params.id as string | undefined
  const supabase = getSupabaseClient()

  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!produktId) {
      setError("Intet produkt id")
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", produktId)
          .single()

          if (error) throw new Error(error.message)
            setProduct(data)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Fejl ved hentning"
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    
    load()
  }, [produktId, supabase])
  


  // marker produkt som solgt hvis det bliver købt
  const soldProduct = async () => {
    // tjek om brugeren er logget ind
    const { data: { user }, } = await supabase.auth.getUser();

    if(!user) {
      alert("Du skal være logget ind for at kunne købe et produkt.")
      return
    }

    const { data, error } = await supabase
      .from("products")
      .update({ sold: true })
      .eq("id", produktId)
      .select();

      if (error) {
        alert("Kunne ikke markere som solgt");
        return;
      }

      setProduct({ ...product, sold: true });
      console.log("UPDATE RESULT:", { data, error });
  }


  if (loading) return <p style={{ padding: 20 }}>Henter produkt...</p>
  if (error) return <p style={{ padding: 20 }}>{error}</p>
  if (!product) return <p style={{ padding: 20 }}>Produkt ikke fundet.</p>
  



  return (
    <Box display={{ xs: "grid", sm: "flex" }} justifyContent={{ sm: "center" }} gap={{ sm: "2rem" }} pt={{ xs: "8rem" }} p={2} height={{ sm: "100vh" }} mb={{ xs: "2rem" }}>
      <Box alignSelf={{ sm: "center" }} mb={{ xs: "1rem" }}>  
          {product.image_url && (
            <Image
              src={product.image_url} 
              alt={product.title}
              width={500}
              height={100}
              style={{
                width: "100%",
                height: "80vh",
                borderRadius: "0.3rem",
              }}        
            />
          )}

          {product.sold && (
          <Box position={"absolute"} bottom={"2.5rem"} p={2} sx={{ backgroundColor: "#000000c9", color: "white" }} width={"auto"}>
              <Typography textTransform={"uppercase"} alignSelf={"center"} justifySelf={"center"}>Solgt</Typography>
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
          <p style={{ color: "gray" }}>{product.color} - {product.stand}</p>
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
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <p>Fee</p>
          <p>10%</p>
        </Box>

        <Button
          onClick={soldProduct}
          // disabled={product.sold}
          sx={{
            width: "100%",
            backgroundColor: "transparent",
            border: "1px solid grey",
            color: "white",
            top: "1rem",
            position: "relative",
            cursor: product.sold ? "none" : "pointer",
            "&:hover": { backgroundColor: product.sold ? "none" : "darkGreen", color: "white", border: product.sold ? "1px solid gray" : "1px solid darkGreen" },
          }}
        >
          {product.sold ? "Solgt" : "Køb"}
        </Button>
      </Box>
    </Box>
  )
}
