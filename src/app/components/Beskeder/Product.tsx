

import ChatKnap from "@/app/components/Beskeder/ChatKnap"
import { supabaseServer } from "@/app/lib/supabaseServer"
import { Box, Button, Divider, Typography } from "@mui/material"
import Image from "next/image"



export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await supabaseServer()




  // hent produkt + ejerens profil i ét query
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      profiles (
        display_name
      )
    `)
    .eq("id", id)
    .single()

  if (error || !product) {
    return <p>Produkt ikke fundet.</p>
  }

  const profileDisplayName = product.profiles?.display_name ?? "Ukendt bruger"
  
  return (
    <Box display={{ xs: "grid", sm: "flex" }} justifyContent={{ sm: "center" }} gap={{ sm: "2rem" }} pt={{ xs: "8rem" }} p={2} height={{ sm: "100vh" }}>
      <Box alignSelf={{ sm: "center" }}>  
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.title}
              width={500}
              height={100}
              style={{
                width: "100%",
                height: "70vh",
                borderRadius: "1rem",
              }}        
            />
          )}
      </Box>

      <Box alignSelf={{ sm: "center" }} width={{ sm: "50vh" }}>
        <Box
          sx={{
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textTransform: "uppercase",
          }}
        >
          <p>{profileDisplayName}</p>
          <ChatKnap productId={id} />
        </Box>
        <Divider sx={{ backgroundColor: "white", width: "100%", mb: 3 }} />

        <Box
          sx={{
            color: "white",
            width: { sm: "300px" }
          }}
        >
          <h1 style={{ fontSize: "1rem" }}>{product.title}</h1>
        </Box>

        <Box
          sx={{
            color: "gray",
            marginTop: "1rem",
            display: "grid",
            gap: "0.5rem",
          }}
        >
          <p>
            Produkt beskrivelse: <br />
            {product.desc} {/* rettet fra product.description */}
          </p>
          <p>Farve: {product.color}</p>
          <p>Brand: {product.brand}</p>
          <p>Tilstand: {product.stand}</p>
        </Box>

        <Divider sx={{ backgroundColor: "white", width: "100%", mb: 3, mt: 3 }} />

        <Box 
          sx={{
            color: "white",
            display: { xs: "flex", sm: "flex" },
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Typography>Price: </Typography>
          <Typography>{product.price?.toFixed(2)} DKK</Typography>
        </Box>

        <Button
          sx={{
            width: "100%",
            backgroundColor: "transparent",
            border: "1px solid grey",
            color: "white",
            top: "1.5rem",
            position: "relative",
            "&:hover": { backgroundColor: "darkGreen", color: "white",border: "1px solid darkGreen" },
          }}
        >
          Køb
        </Button>
      </Box>
    </Box>
  )
}
