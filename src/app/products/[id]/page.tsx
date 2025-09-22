
import { supabase } from "@/lib/supabaseClient"
import { Box, Button, Divider, Typography } from "@mui/material"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params 


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
    <Box 
      sx={{ 
        paddingBottom: { xs: "6rem"},
        display: { sm: "flex" },
        alignItems: { sm: "center" },
        justifyContent: { sm: "space-around" },
        maxWidth: { sm: 1000 }, 
        mx: { sm: "auto" } , 
        p: { sm: "12rem 1rem" }, 
      }}>
          {product.image_url && (
            <Box
              component="img"
              src={product.image_url}
              alt={product.title}
              sx={{
                width: {
                  xs: "100%",   // mobil
                  sm: "35%",  // tablet/desktop
                },
                borderRadius: { xs: "0", sm: "1rem"}
              }}        
              />
            )}

      <Box sx={{ padding: "1rem" }}>
        <Box
          sx={{
            color: "black",
            display: { xs: "flex", sm: "flex" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p>{profileDisplayName}</p>
          <Button
            style={{ cursor: "pointer", color: "black" }}
            href={`/chat/product/${product.id}`}
          >
            Start chat
          </Button>
        </Box>

        <Divider sx={{ backgroundColor: "black", width: "100%", mb: 3 }} />

        <Box
          sx={{
            color: "black",
            width: { sm: "300px" }
          }}
        >
          <h1 style={{ fontSize: "1rem" }}>{product.title}</h1>
        </Box>

        <Box
          sx={{
            color: "black",
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

        <Divider sx={{ backgroundColor: "black", width: "100%", mb: 3, mt: 3 }} />

        <Box 
          sx={{
            color: "black",
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
            backgroundColor: "gray",
            color: "white",
            top: "1.5rem",
            position: "relative",
            "&:hover": { backgroundColor: "black", color: "white" },
          }}
        >
          Køb
        </Button>
      </Box>
    </Box>
  )
}
