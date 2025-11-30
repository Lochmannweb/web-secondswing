"use client"

import { createProduct } from "@/lib/crud"
import { getSupabase } from "@/lib/supabaseClient"
import { Box, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl, OutlinedInput } from "@mui/material"
import type React from "react"
import { useState } from "react"

export default function CreateProduct() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [gender, setGender] = useState<"female" | "male" | "unisex">("female")
  const [color, setColor] = useState<"Farve" | "Hvid" | "Sort" | "Grå">("Farve")
  const [size, setSize] = useState<"Størrelse" | "XS" | "S" | "M" | "L" | "XL">("Størrelse")
  const [stand, setStand] = useState<"Tilstand" | "Nyt" | "Brugt" | "Brugspor">("Tilstand")
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)




  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.readAsDataURL(file)
    }
  }
  



  const uploadImage = async (file: File): Promise<string> => {
    const supabase = getSupabase()
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error } = await supabase.storage.from("avatars").upload(fileName, file)
    if (error) throw new Error(`Kunne ikke uploade billede: ${error.message}`)

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName)
    if (!publicUrl) throw new Error("Kunne ikke generere offentlig URL for billedet")
    return publicUrl
  }



  // bruger CRUD.ts
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = getSupabase()

      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Du skal være logget ind for at oprette et produkt")

      // Check profilen eksisterer 
      const { error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code === "PGRST116") {
        const { error: createProfileError } = await supabase
          .from("products")
          .insert({ id: user.id, created_at: new Date().toISOString() });

          if (createProfileError) {
            throw new Error("Kunne ikke oprette din profil");
          } else if (profileError) {
            throw new Error("Profil kunne ikke verificeres");
          }
      }


      // Upload image
      let imageUrl = null
      if (imageFile) imageUrl = await uploadImage(imageFile);



      // CRUD - Create product
      await createProduct({
        user_id: user.id,
        title,
        description,
        price: Number(price),
        gender,
        color,
        size,
        stand,
        image_url: imageUrl,
      });
      setMessage({ type: "success", text: "Produkt blev oprettet!" })



      // Reset form
      setTitle("")
      setDescription("")
      setPrice("")
      setGender("female")
      setColor("Farve")
      setSize("Størrelse")
      setStand("Tilstand")
      setImageFile(null)


    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ type: "error", text: "Der opstod en fejl" })
      }
    }
  }



  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%&", height: "50vh" }}>
        {/* vis valgte billeder her */}
      </Box>

      <Box p={2}>
          <TextField 
            label="Titel" 
            variant="outlined"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            fullWidth
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "gray"
                },
                "&:hover fieldset": {
                  borderColor: "gray"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "gray"
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiInputLabel-root.MuiFormLabel-filled": {
                color: "white",
              },
            }}
          />

          <TextField 
            label="Beskrivelse" 
            variant="outlined"
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            fullWidth
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "gray"
                },
                "&:hover fieldset": {
                  borderColor: "gray"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "gray"
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiInputLabel-root.MuiFormLabel-filled": {
                color: "white",
              },
            }}
          />

          <FormControl 
            fullWidth 
            required 
            sx={{ 
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "transparent",
                "& fieldset": {
                  borderColor: "gray",
                },
                "&:hover fieldset": {
                  borderColor: "gray",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "gray",
                },
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
              },
              "& .MuiInputLabel-root.MuiFormLabel-filled": {
                color: "white",
              },
            }}
          >
            <InputLabel>Farve</InputLabel>
          
            <Select
              label="Farve"
              value={color}
              onChange={(e) =>
                setColor(e.target.value as "Hvid" | "Sort" | "Grå")
              }
              input={ <OutlinedInput label="Gender" /> }
              sx={{ color: "white" }}
            >
              <MenuItem value="white">Hvid</MenuItem>
              <MenuItem value="black">Sort</MenuItem>
              <MenuItem value="gray">Grå</MenuItem>
            </Select>
          </FormControl>    

          <FormControl 
            fullWidth 
            required 
            sx={{ 
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "transparent",
                "& fieldset": {
                  borderColor: "gray",
                },
                "&:hover fieldset": {
                  borderColor: "gray",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "gray",
                },
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
              },
              "& .MuiInputLabel-root.MuiFormLabel-filled": {
                color: "white",
              },
            }}
          >
            <InputLabel>Størrelse</InputLabel>
          
            <Select
              label="Størrelse"
              value={size}
              onChange={(e) =>
                setSize(e.target.value as "XS" | "S" | "M" | "L" | "XL")
              }
              input={ <OutlinedInput label="Størrelse" /> }
              sx={{ color: "white" }}
            >
              <MenuItem value="xs">XS</MenuItem>
              <MenuItem value="m">S</MenuItem>
              <MenuItem value="m">M</MenuItem>
              <MenuItem value="l">L</MenuItem>
              <MenuItem value="xl">XL</MenuItem>
            </Select>
          </FormControl>    

          <FormControl 
            fullWidth 
            required 
            sx={{ 
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "transparent",
                "& fieldset": {
                  borderColor: "gray",
                },
                "&:hover fieldset": {
                  borderColor: "gray",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "gray",
                },
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
              },
              "& .MuiInputLabel-root.MuiFormLabel-filled": {
                color: "white",
              },
            }}
          >
            <InputLabel>Gender</InputLabel>
          
            <Select
              label="Gender"
              value={gender}
              onChange={(e) =>
                setGender(e.target.value as "female" | "male")
              }
              input={ <OutlinedInput label="Gender" /> }
              sx={{ color: "white" }}
            >
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="male">Male</MenuItem>
            </Select>
          </FormControl>     

          <FormControl 
            fullWidth 
            required 
            sx={{ 
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "transparent",
                "& fieldset": {
                  borderColor: "gray",
                },
                "&:hover fieldset": {
                  borderColor: "gray",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "gray",
                },
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
              },
              "& .MuiInputLabel-root.MuiFormLabel-filled": {
                color: "white",
              },
            }}
          >
            <InputLabel>Tilstand</InputLabel>
          
            <Select
              label="Tilstand"
              value={stand}
              onChange={(e) =>
                setStand(e.target.value as "Nyt" | "Brugt" | "Brugspor")
              }
              input={ <OutlinedInput label="Tilstand" /> }
              sx={{ color: "white" }}
            >
              <MenuItem value="nyt">Nyt</MenuItem>
              <MenuItem value="brugt">Brugt</MenuItem>
              <MenuItem value="brugspor">Brugspor</MenuItem>
            </Select>
          </FormControl>          

          <TextField 
            label="Pris" 
            variant="outlined"
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required 
            fullWidth
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "gray"
                },
                "&:hover fieldset": {
                  borderColor: "gray"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "gray"
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiInputLabel-root.MuiFormLabel-filled": {
                color: "white",
              },
            }}
          />


          <Button 
            variant="outlined" 
            component="label"
            fullWidth
            sx={{
              mb: 2,
              backgroundColor: "transparent",
              border: "1px solid gray",
              color: "white",
              "&:hover": {
                backgroundColor: "#00ff001c",
                border: "1px solid #00ff001c"
              }
            }}
            >
              Vælg billede

            <input 
              type="file" 
              hidden 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </Button>

          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            fullWidth
            disabled={!title || !description || !color || !size || !gender || !stand || !price || !imageFile}
            sx={{
              backgroundColor: "transparent",
              border: "1px solid gray",
              "&:hover": {
                backgroundColor: "#00ff001c",
                border: "1px solid #00ff001c"
              }
            }}
          >
            {loading ? "Opretter..." : "Opret Produkt"}
          </Button>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
      </Box>
    </Box>
  )
}



