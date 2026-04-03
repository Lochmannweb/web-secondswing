"use client"

import React, { useEffect, useState } from "react"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import {
  CLOTHING_SIZE_OPTIONS,
  COLOR_OPTIONS,
  SHOE_SIZE_OPTIONS,
  STAND_OPTIONS,
} from "@/app/lib/productForm"
import type { ProductCategory } from "@/app/lib/productForm"
import SearchBar from "@/app/components/Shop/SearchBar"
import FilterButtons from "@/app/components/Shop/FilterButtons"
import type { Filter } from "@/app/utils/filterStyles"
import { 
  Typography, 
  Card, 
  CardMedia, 
  Grid, 
  IconButton,
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
} from "@mui/material"
import FavoriteIcon from '@mui/icons-material/Favorite'
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import TuneIcon from "@mui/icons-material/Tune"
import Link from "next/link"
import { useRouter } from "next/navigation"
import "../shop/shop.css"
import "./favorit.css"

interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
  gender: "male" | "female" | "unisex" | null
  category?: ProductCategory | null
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

const normalizeFacetValue = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export default function Favoriter() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [loginRequired, setLoginRequired] = useState(false)
  const [activeFilter, setActiveFilter] = useState<Filter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeColors, setActiveColors] = useState<string[]>([])
  const [activeSizes, setActiveSizes] = useState<string[]>([])
  const [activeStands, setActiveStands] = useState<string[]>([])
  const [activeGenders, setActiveGenders] = useState<string[]>([])
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

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
      results = results.filter((product) => (product.category ?? "other") === activeFilter)
    }

    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase()
      results = results.filter((product) => product.title.toLowerCase().includes(normalizedQuery))
    }

    if (activeColors.length > 0) {
      results = results.filter((product) => {
        const color = normalizeFacetValue(product.color)
        return color ? activeColors.includes(color) : false
      })
    }

    if (activeSizes.length > 0) {
      results = results.filter((product) => {
        const size = normalizeFacetValue(product.size)
        return size ? activeSizes.includes(size) : false
      })
    }

    if (activeStands.length > 0) {
      results = results.filter((product) => {
        const stand = normalizeFacetValue(product.stand)
        return stand ? activeStands.includes(stand) : false
      })
    }

    if (activeGenders.length > 0) {
      results = results.filter((product) => {
        const gender = normalizeFacetValue(product.gender)
        return gender ? activeGenders.includes(gender) : false
      })
    }

    setFilteredProducts(results)
  }, [
    products,
    activeFilter,
    searchQuery,
    activeColors,
    activeSizes,
    activeStands,
    activeGenders,
  ])

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

  const handleFilter = (filter: Filter) => {
    setActiveFilter(filter)
  }

  const toggleFacet = (currentState: string[], value: string, setter: (value: string[]) => void) => {
    if (currentState.includes(value)) {
      setter(currentState.filter((item) => item !== value))
      return
    }

    setter([...currentState, value])
  }

  const colorOptions = Array.from(new Set([
    ...COLOR_OPTIONS.map((option) => option.value),
    ...products.map((product) => normalizeFacetValue(product.color)).filter(Boolean) as string[],
  ])).sort()

  const sizeOptions = Array.from(new Set([
    ...CLOTHING_SIZE_OPTIONS.map((option) => option.value),
    ...SHOE_SIZE_OPTIONS.map((option) => option.value),
    ...products.map((product) => normalizeFacetValue(product.size)).filter(Boolean) as string[],
  ])).sort()

  const standOptions = Array.from(new Set([
    ...STAND_OPTIONS.map((option) => option.value),
    ...products.map((product) => normalizeFacetValue(product.stand)).filter(Boolean) as string[],
  ])).sort()

  const genderOptions = [
    { value: "female", label: "Kvinde" },
    { value: "male", label: "Mand" },
    { value: "unisex", label: "Unisex" },
  ]

  const clearAdvancedFilters = () => {
    setActiveColors([])
    setActiveSizes([])
    setActiveStands([])
    setActiveGenders([])
  }

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.push("/profile")
  }

  if (loading) return <Alert severity="info" className="shop-loading-alert">Indlaeser favoritter...</Alert>
  if (loginRequired) {
    return (
      <Alert severity="info" className="favoriter-login-alert">
        Log ind for at se dine favoritter.
      </Alert>
    )
  }

  return (
    <Box className="shop-page favoriter-page">
      <Box className="shop-page-layout">
        <Box className="shop-page-sidebar">
          <Box className="favoriter-back-row">
            <Button
              className="favoriter-back-button"
              onClick={handleBack}
            >
              <NavigateBeforeIcon />
            </Button>
            <Typography variant="overline" className="shop-page-kicker">
              Favoritter
            </Typography>
          </Box>

          <Box className="shop-page-header">
            <Typography variant="h3" className="shop-page-title">
              Brugt golfudstyr klar til næste runde.
            </Typography>
            {/* <Typography className="shop-page-description">
              Søg i dine favoritter og filtrer dem, så du hurtigere finder det rigtige udstyr.
            </Typography> */}
          </Box>

          <Box className="shop-mobile-search-row">
            <Box className="shop-mobile-search-grow">
              <SearchBar onSearch={handleSearch} />
            </Box>
            <Button
              className="shop-mobile-filter-trigger"
              onClick={() => setIsFilterDrawerOpen(true)}
              endIcon={<TuneIcon />}
            >
              Filtrer
            </Button>
          </Box>

          <Box className="shop-category-filter-inline">
            <FilterButtons activeFilter={activeFilter} onFilterChange={handleFilter} />
          </Box>

          <Box className="shop-advanced-filter-wrap">
            <Typography className="shop-advanced-filter-title">Køn</Typography>
            <Box className="shop-filter-chip-grid">
              {genderOptions.map((gender) => (
                <Chip
                  key={`favorit-gender-${gender.value}`}
                  label={gender.label}
                  clickable
                  onClick={() => toggleFacet(activeGenders, gender.value, setActiveGenders)}
                  className={`shop-filter-chip${activeGenders.includes(gender.value) ? " is-active" : ""}`}
                />
              ))}
            </Box>

            <Typography className="shop-advanced-filter-title">Farve</Typography>
            <Box className="shop-filter-chip-grid">
              {colorOptions.map((color) => (
                <Chip
                  key={`favorit-color-${color}`}
                  label={color}
                  clickable
                  onClick={() => toggleFacet(activeColors, color, setActiveColors)}
                  className={`shop-filter-chip${activeColors.includes(color) ? " is-active" : ""}`}
                />
              ))}
            </Box>

            <Typography className="shop-advanced-filter-title">Størrelse</Typography>
            <Box className="shop-filter-chip-grid">
              {sizeOptions.map((size) => (
                <Chip
                  key={`favorit-size-${size}`}
                  label={size}
                  clickable
                  onClick={() => toggleFacet(activeSizes, size, setActiveSizes)}
                  className={`shop-filter-chip${activeSizes.includes(size) ? " is-active" : ""}`}
                />
              ))}
            </Box>

            <Typography className="shop-advanced-filter-title">Tilstand</Typography>
            <Box className="shop-filter-chip-grid">
              {standOptions.map((stand) => (
                <Chip
                  key={`favorit-stand-${stand}`}
                  label={stand}
                  clickable
                  onClick={() => toggleFacet(activeStands, stand, setActiveStands)}
                  className={`shop-filter-chip${activeStands.includes(stand) ? " is-active" : ""}`}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Box className="shop-page-products">
          {filteredProducts.length === 0 ? (
            <Alert severity="info">
              Ingen favoritter matcher din sogning endnu.
            </Alert>
          ) : (
            <Grid container spacing={2} className="shop-product-grid">
              {filteredProducts.map((product) => {
                return (
                <Grid size={{ xs: 6, sm: 6, md: 3 }} key={product.id} className="shop-product-grid-item">
                  <Card className="shop-product-card">
                    <Box className="shop-product-media-wrap">
                      {product.sold && (
                        <Box className="shop-soldout">
                          <p>Solgt</p>
                        </Box>
                      )}
                      <IconButton
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          removeFavorite(product.id)
                        }}
                        className="shop-favorite-button favorit-remove-button"
                      >
                        <FavoriteIcon />
                      </IconButton>

                      <Link href={`/products/${product.id}`} className="shop-product-hitarea" aria-label={`Ga til ${product.title}`}>
                        {product.image_url && (
                          <CardMedia component="img" image={product.image_url} alt={product.title} className="shop-product-image" />
                        )}
                        <Box className="shop-product-overlay">
                          <Typography component="h2" className="shop-product-title">
                            {product.title}
                          </Typography>
                          {product.price && (
                            <Typography className="shop-product-price">
                              {product.price.toFixed(2)} DKK
                            </Typography>
                          )}
                        </Box>
                      </Link>
                    </Box>
                  </Card>
                </Grid>
                )
              })}
            </Grid>
          )}
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        className="shop-filter-drawer"
        PaperProps={{ className: "shop-filter-drawer-paper" }}
      >
        <Box className="shop-filter-drawer-inner">
          <Box className="shop-filter-drawer-top">
            <Typography variant="overline" className="shop-filter-drawer-kicker">Filtrer</Typography>
            <Button onClick={() => setIsFilterDrawerOpen(false)} className="shop-filter-drawer-close">Luk</Button>
          </Box>

          <Typography className="shop-advanced-filter-title">Kategori</Typography>
          <FilterButtons activeFilter={activeFilter} onFilterChange={handleFilter} />

          <Typography className="shop-advanced-filter-title">Kon</Typography>
          <Box className="shop-filter-chip-grid">
            {genderOptions.map((gender) => (
              <Chip
                key={`drawer-favorit-gender-${gender.value}`}
                label={gender.label}
                clickable
                onClick={() => toggleFacet(activeGenders, gender.value, setActiveGenders)}
                className={`shop-filter-chip${activeGenders.includes(gender.value) ? " is-active" : ""}`}
              />
            ))}
          </Box>

          <Typography className="shop-advanced-filter-title">Farve</Typography>
          <Box className="shop-filter-chip-grid">
            {colorOptions.map((color) => (
              <Chip
                key={`drawer-favorit-color-${color}`}
                label={color}
                clickable
                onClick={() => toggleFacet(activeColors, color, setActiveColors)}
                className={`shop-filter-chip${activeColors.includes(color) ? " is-active" : ""}`}
              />
            ))}
          </Box>

          <Typography className="shop-advanced-filter-title">Storrelse</Typography>
          <Box className="shop-filter-chip-grid">
            {sizeOptions.map((size) => (
              <Chip
                key={`drawer-favorit-size-${size}`}
                label={size}
                clickable
                onClick={() => toggleFacet(activeSizes, size, setActiveSizes)}
                className={`shop-filter-chip${activeSizes.includes(size) ? " is-active" : ""}`}
              />
            ))}
          </Box>

          <Typography className="shop-advanced-filter-title">Tilstand</Typography>
          <Box className="shop-filter-chip-grid">
            {standOptions.map((stand) => (
              <Chip
                key={`drawer-favorit-stand-${stand}`}
                label={stand}
                clickable
                onClick={() => toggleFacet(activeStands, stand, setActiveStands)}
                className={`shop-filter-chip${activeStands.includes(stand) ? " is-active" : ""}`}
              />
            ))}
          </Box>

          <Box className="shop-filter-drawer-actions">
            <Button onClick={clearAdvancedFilters} className="shop-filter-reset-button">Nulstil</Button>
            <Button onClick={() => setIsFilterDrawerOpen(false)} className="shop-filter-apply-button">
              Vis produkter ({filteredProducts.length})
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}
