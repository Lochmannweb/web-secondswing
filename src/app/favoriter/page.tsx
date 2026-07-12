"use client";

import { useEffect, useMemo, useState } from "react";
import {
  applyShopFilters,
  countActiveFacets,
  getFacetsForFilter,
  getVisibleProducts,
  pruneActiveFacets,
  type ActiveShopFacets,
  type ShopFacetKey,
} from "@/app/lib/shopFilters";
import { listFavoriteProducts } from "@/app/lib/favoritesApi";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import SearchBar from "@/app/components/Shop/SearchBar";
import AllProducts from "@/app/components/Products/AllProducts";
import CatalogCategoryNav from "@/app/components/Shop/CatalogCategoryNav";
import CatalogFilterDrawer from "@/app/components/Shop/CatalogFilterDrawer";
import { Alert, Box, Drawer } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import type { Filter } from "@/app/utils/filterStyles";
import type { ProductCategory } from "@/app/lib/productForm";
import "../shop/shop.css";
import "./favorit.css";

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

export default function FavoriterPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFacets, setActiveFacets] = useState<ActiveShopFacets>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchFavoritesWithProducts = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoginRequired(true);
        setLoading(false);
        return;
      }

      const productData = await listFavoriteProducts(userData.user.id);
      setProducts(productData);

      setLoading(false);
    };

    fetchFavoritesWithProducts();
  }, [supabase]);

  useEffect(() => {
    setActiveFacets((current) =>
      pruneActiveFacets(current, getFacetsForFilter(activeFilter))
    );
  }, [activeFilter]);

  const visibleProducts = useMemo(
    () => getVisibleProducts(products, null, activeFilter),
    [products, activeFilter]
  );

  const filteredProducts = useMemo(
    () =>
      applyShopFilters(products, {
        userId: null,
        activeFilter,
        searchQuery,
        activeFacets,
      }),
    [products, activeFilter, searchQuery, activeFacets]
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

  const handleFavoriteRemoved = (productId: string) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
  };

  const activeFacetCount = countActiveFacets(activeFacets, searchQuery);

  if (loading) {
    return (
      <Alert severity="info" className="shop-loading-alert">
        Indlæser favoritter...
      </Alert>
    );
  }

  if (loginRequired) {
    return (
      <Alert severity="info" className="shop-loading-alert">
        Log ind for at se dine favoritter.
      </Alert>
    );
  }

  return (
    <Box className="shop-page favoriter-page">
      <h1 className="shop-catalog-title">Favoritter</h1>

      <div className="shop-catalog-toolbar">
        <CatalogCategoryNav
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          products={products}
          userId={null}
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

      {products.length === 0 ? (
        <Alert severity="info" className="catalog-empty-alert">
          Du har ingen favoritter endnu.
        </Alert>
      ) : filteredProducts.length === 0 ? (
        <Alert severity="info" className="catalog-empty-alert">
          Ingen favoritter matcher din søgning.
        </Alert>
      ) : (
        <AllProducts
          products={filteredProducts}
          onFavoriteRemoved={handleFavoriteRemoved}
        />
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
