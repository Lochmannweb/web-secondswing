"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import SearchBar from "@/app/components/Shop/SearchBar"
import AllProducts from "@/app/components/Products/AllProducts"
import { Alert, Box } from "@mui/material"
import FilterButtons from "@/app/components/Shop/FilterButtons"

interface Product {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  created_at: string
  user_id: string
  gender: "male" | "female" | "unisex" | null
  sold: boolean | null
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<"all" | "male" | "female">("all")
  const supabase = getSupabaseClient();




  // Læs filter fra URL ved mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const filter = params.get("filter")
    if (filter === "male" || filter === "female" || filter === "all") {
      setActiveFilter(filter)
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
    if (activeFilter !== "all") results = results.filter(p => p.gender === activeFilter)
    setFilteredProducts(results)
  }, [products, activeFilter, userId])

  const handleSearch = (query: string) => {
    let results = [...products]
    if (userId) results = results.filter(p => p.user_id !== userId)
    if (activeFilter !== "all") results = results.filter(p => p.gender === activeFilter)
    if (query) results = results.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
    setFilteredProducts(results)
  }

  const handleFilter = (filter: "all" | "male" | "female") => {
    setActiveFilter(filter)
  }

  // if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box 
      sx={{ maxWidth: 1200, mx: "auto", p: 2, pb: "6rem" }}
    >
      <SearchBar onSearch={handleSearch} />
      <FilterButtons activeFilter={activeFilter} onFilterChange={handleFilter} />
      <AllProducts products={filteredProducts} />
    </Box>
  )
}
