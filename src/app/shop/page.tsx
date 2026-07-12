"use client";

import { useEffect, useMemo, useState } from "react";
import { PRODUCT_CATEGORIES } from "@/app/lib/productForm";
import type { ProductCategory } from "@/app/lib/productForm";
import {
  applyShopFilters,
  countActiveFacets,
  getFacetsForFilter,
  getVisibleProducts,
  pruneActiveFacets,
  type ActiveShopFacets,
  type ShopFacetKey,
  type ShopProduct,
} from "@/app/lib/shopFilters";
import { getProduct } from "@/app/lib/crud";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import SearchBar from "@/app/components/Shop/SearchBar";
import AllProducts from "@/app/components/Products/AllProducts";
import CatalogCategoryNav from "@/app/components/Shop/CatalogCategoryNav";
import CatalogFilterDrawer from "@/app/components/Shop/CatalogFilterDrawer";
import { Alert, Box, Drawer } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import type { Filter } from "@/app/utils/filterStyles";
import "./shop.css";

interface Product {
  id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  gender: string | null;
  category?: string | null;
  color?: string | null;
  size?: string | null;
  stand?: string | null;
  brand?: string | null;
  club_type?: string | null;
  flex?: string | null;
  hand?: string | null;
  divider_count?: number | null;
  weight?: string | null;
  sold: boolean | null;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFacets, setActiveFacets] = useState<ActiveShopFacets>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");
    if (filter === "all") {
      setActiveFilter("all");
      return;
    }

    if (PRODUCT_CATEGORIES.includes(filter as ProductCategory)) {
      setActiveFilter(filter as ProductCategory);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const loggedInUserId = sessionData.session?.user.id ?? null;
        setUserId(loggedInUserId);

        const data = await getProduct();
        setProducts(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Ukendt fejl";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [supabase]);

  useEffect(() => {
    setActiveFacets((current) =>
      pruneActiveFacets(current, getFacetsForFilter(activeFilter))
    );
  }, [activeFilter]);

  const visibleProducts = useMemo(
    () => getVisibleProducts(products, userId, activeFilter),
    [products, userId, activeFilter]
  );

  const filteredProducts = useMemo(
    () =>
      applyShopFilters(products, {
        userId,
        activeFilter,
        searchQuery,
        activeFacets,
      }),
    [products, userId, activeFilter, searchQuery, activeFacets]
  );

  const handleFilterChange = (filter: Filter) => {
    setActiveFilter(filter);
    setSearchQuery("");
    setActiveFacets({});
  };

  const toggleFacet = (facet: ShopFacetKey, value: string) => {
    setActiveFacets((current) => {
      const selected = current[facet] ?? [];
      const nextValues = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];

      return pruneActiveFacets(
        {
          ...current,
          [facet]: nextValues,
        },
        getFacetsForFilter(activeFilter)
      );
    });
  };

  const clearFilters = () => {
    setActiveFacets({});
  };

  const activeFacetCount = countActiveFacets(activeFacets, "");

  if (loading) {
    return (
      <Alert severity="info" className="shop-loading-alert">
        Henter produkter...
      </Alert>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box className="shop-page">
      <h1 className="shop-catalog-title">Golf udstyr</h1>

      <div className="shop-catalog-toolbar">
        <CatalogCategoryNav
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          products={products}
          userId={userId}
        />

        <div className="shop-catalog-toolbar-actions">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            className="shop-catalog-search"
          />

          <button
            type="button"
            className={`shop-catalog-filter-btn${activeFacetCount > 0 ? " is-active" : ""}`}
            onClick={() => setIsFilterDrawerOpen(true)}
            aria-label="Åbn filtre"
          >
            <FilterListIcon />
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <Alert severity="info" className="catalog-empty-alert">
          Din søgning gav ingen resultater
        </Alert>
      ) : (
        <AllProducts products={filteredProducts} />
      )}

      <Drawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        className="shop-filter-drawer"
        PaperProps={{ className: "shop-filter-drawer-paper" }}
      >
        <CatalogFilterDrawer
          activeFilter={activeFilter}
          visibleProducts={visibleProducts}
          activeFacets={activeFacets}
          onFacetToggle={toggleFacet}
          onClear={clearFilters}
          onClose={() => setIsFilterDrawerOpen(false)}
          resultCount={filteredProducts.length}
        />
      </Drawer>
    </Box>
  );
}
