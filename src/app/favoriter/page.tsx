"use client"

import React, { useEffect, useState } from "react"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import SearchBar from "@/app/components/Shop/SearchBar"
import FilterButtons from "@/app/components/Shop/FilterButtons"
import { 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  IconButton,
  Alert,
  Box,
  Button,
} from "@mui/material"
import FavoriteIcon from '@mui/icons-material/Favorite'
import Link from "next/link"

interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
  gender: "male" | "female" | "unisex" | null
  sold: boolean | null;
}

export default function Favoriter() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [loginRequired, setLoginRequired] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "male" | "female">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchFavoritesWithProducts = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setLoginRequired(true)
        setLoading(false)
        return
      }
      setUserId(userData.user.id)

      // Hent alle favoritter for brugeren
      const { data: favData, error: favError } = await supabase
        .from("favoriter")
        .select("product_id")
        .eq("user_id", userData.user.id)

      if (favError) {
        console.error("Fejl ved hentning af favoritter:", favError)
        setLoading(false)
        return
      }

      const productIds = favData.map((f: { product_id: string }) => f.product_id)

      if (!productIds.length) {
        setProducts([])
        setLoading(false)
        return
      }

      // Hent tilhørende produkter
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)

      if (productError) console.error("Fejl ved hentning af produkter:", productError)
      else setProducts(productData || [])

      setLoading(false)
    }

    fetchFavoritesWithProducts()
  }, [supabase])

  useEffect(() => {
    let results = [...products]

    if (activeFilter !== "all") {
      results = results.filter((product) => product.gender === activeFilter)
    }

    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase()
      results = results.filter((product) => product.title.toLowerCase().includes(normalizedQuery))
    }

    setFilteredProducts(results)
  }, [products, activeFilter, searchQuery])

  const removeFavorite = async (productId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from("favoriter")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
      if (error) console.error("Fejl ved sletning:", error)
      else {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (filter: "all" | "male" | "female") => {
    setActiveFilter(filter)
  }

  if (loading) return <Typography>Indlæser favoritter...</Typography>
  if (loginRequired) return <Alert severity="info">Log ind for at se dine favoritter.</Alert>

  return (
    <Box className="shop-page">
      <Box className="shop-page-header">
        <Typography variant="overline" className="shop-page-kicker">
          Favoritter
        </Typography>
        <Typography variant="h3" className="shop-page-title">
          Dine favoritter samlet et sted.
        </Typography>
        <Typography className="shop-page-description">
          Sog i dine favoritter og filtrer dem, sa du hurtigere finder det rigtige udstyr.
        </Typography>
      </Box>

      <Box className="shop-page-layout">
        <Box className="shop-page-sidebar">
          <SearchBar onSearch={handleSearch} />
          <FilterButtons activeFilter={activeFilter} onFilterChange={handleFilter} />
        </Box>

        <Box className="shop-page-products">
          {filteredProducts.length === 0 ? (
            <Alert severity="info">
              Ingen favoritter matcher din sogning endnu.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid size={{ xs: 6, sm: 6, md: 3 }} key={product.id}>
                  <Card className="FavoriterPage-card">
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
                    <CardContent className="FavoriterPage-cardContent">
                      <Box className="FavoriterPage-cardHeader">
                        <Typography className="FavoriterPage-cardTitle" component="h2">
                          {product.title}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => removeFavorite(product.id)}
                        className="FavoriterPage-iconButton"
                      >
                        <FavoriteIcon />
                      </IconButton>
                      {product.description && (
                        <Typography variant="body2" className="FavoriterPage-description">
                          {product.description}
                        </Typography>
                      )}
                      {product.price && (
                        <Typography className="FavoriterPage-price">
                          {product.price.toFixed(2)} DKK
                        </Typography>
                      )}
                    </CardContent>
                    <Button
                      component={Link}
                      href={`/products/${product.id}`}
                      className="FavoriterPage-linkButton"
                    >
                      Se produkt
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  )
}
