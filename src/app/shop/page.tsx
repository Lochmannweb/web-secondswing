"use client"

import { useEffect, useState } from "react"
import {
  CLOTHING_SIZE_OPTIONS,
  COLOR_OPTIONS,
  PRODUCT_CATEGORIES,
  SHOE_SIZE_OPTIONS,
  STAND_OPTIONS,
} from "@/app/lib/productForm"
import type { ProductCategory } from "@/app/lib/productForm"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import SearchBar from "@/app/components/Shop/SearchBar"
import AllProducts from "@/app/components/Products/AllProducts"
import { Alert, Box, Button, Chip, Drawer, Typography } from "@mui/material"
import TuneIcon from "@mui/icons-material/Tune"
import FilterButtons from "@/app/components/Shop/FilterButtons"
import type { Filter } from "@/app/utils/filterStyles"
import "./shop.css"

interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
  user_id: string
  gender: "male" | "female" | "unisex" | null
  category?: ProductCategory | null
  color?: string | null
  size?: string | null
  stand?: string | null
  brand?: string | null
  sold: boolean | null
}

const normalizeFacetValue = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<Filter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeColors, setActiveColors] = useState<string[]>([])
  const [activeSizes, setActiveSizes] = useState<string[]>([])
  const [activeStands, setActiveStands] = useState<string[]>([])
  const [activeGenders, setActiveGenders] = useState<string[]>([])
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const supabase = getSupabaseClient()




  // Læs filter fra URL ved mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const filter = params.get("filter")
    if (filter === "all") {
      setActiveFilter("all")
      return
    }

    if (PRODUCT_CATEGORIES.includes(filter as ProductCategory)) {
      setActiveFilter(filter as ProductCategory)
    }
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {

        // Hent logget ind bruger
        const { data: sessionData } = await supabase.auth.getSession()
        const loggedInUserId = sessionData.session?.user.id ?? null
        setUserId(loggedInUserId)

        // const accessToken = sessionData.session?.access_token
        // console.log("accessToken: ", accessToken);
        

        // Hent alle produkter
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setProducts(data || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [supabase])

  useEffect(() => {
    let results = [...products]
    if (userId) results = results.filter(p => p.user_id !== userId)
    if (activeFilter !== "all") {
      results = results.filter((product) => (product.category ?? "other") === activeFilter)
    }

    if (searchQuery.trim()) {
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
  }, [products, activeFilter, userId, searchQuery, activeColors, activeSizes, activeStands, activeGenders])

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

  if (loading) return <Alert severity="info" className="shop-loading-alert">Henter produkter...</Alert>
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box className={"shop-page"}>
      <Box className="shop-page-layout">
        <Box className="shop-page-sidebar">
          <Box className="shop-page-header">
            <Typography variant="overline" className="shop-page-kicker">
              Shop
            </Typography>
            <Typography variant="h3" className="shop-page-title">
              Brugt golfudstyr klar til næste runde.
            </Typography>
            {/* <Typography className="shop-page-description">
              Brugt golfudstyr, klar til næste runde.
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
                  key={gender.value}
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
                  key={color}
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
                  key={size}
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
                  key={stand}
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
            <Alert severity="info">Du skal være logget ind for at kunne se produkter</Alert>
          ) : (
            <AllProducts products={filteredProducts} />
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

          <Typography className="shop-advanced-filter-title">KØn</Typography>
          <Box className="shop-filter-chip-grid">
            {genderOptions.map((gender) => (
              <Chip
                key={`drawer-gender-${gender.value}`}
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
                key={`drawer-color-${color}`}
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
                key={`drawer-size-${size}`}
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
                key={`drawer-stand-${stand}`}
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
