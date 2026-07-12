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
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import { deleteProduct, getProductsByUser } from "@/app/lib/crud";
import SearchBar from "@/app/components/Shop/SearchBar";
import CatalogCategoryNav from "@/app/components/Shop/CatalogCategoryNav";
import CatalogFilterDrawer from "@/app/components/Shop/CatalogFilterDrawer";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import Link from "next/link";
import type { Filter } from "@/app/utils/filterStyles";
import type { ProductCategory } from "@/app/lib/productForm";
import "../shop/shop.css";
import "./produkter.css";

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

export default function ProdukterPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFacets, setActiveFacets] = useState<ActiveShopFacets>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Du skal være logget ind for at se dine produkter");
          return;
        }

        const userProducts = await getProductsByUser(user.id);
        setProducts(userProducts);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Der opstod en fejl ved hentning af produkter";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
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

  const openDeleteDialog = (productId: string) => {
    setSelectedProductId(productId);
    setOpenDialog(true);
  };

  const deleteProdukt = async () => {
    if (!selectedProductId) return;

    try {
      await deleteProduct(selectedProductId);
      setProducts((prev) => prev.filter((product) => product.id !== selectedProductId));
      setOpenDialog(false);
      setSelectedProductId(null);
    } catch {
      alert("Kunne ikke slette produktet");
    }
  };

  const activeFacetCount = countActiveFacets(activeFacets, searchQuery);

  if (loading) {
    return (
      <Alert severity="info" className="shop-loading-alert">
        Indlæser dine produkter...
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="shop-loading-alert">
        {error}
      </Alert>
    );
  }

  return (
    <Box className="shop-page produkter-page">
      <h1 className="shop-catalog-title">Mine produkter</h1>

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

          <Link href="/opretProdukt" className="produkter-create-link">
            Opret annonce
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <Alert severity="info" className="catalog-empty-alert">
          Du har ikke oprettet nogen produkter endnu.{" "}
          <Link href="/opretProdukt" className="produkter-inline-link">
            Opret din første annonce
          </Link>
        </Alert>
      ) : filteredProducts.length === 0 ? (
        <Alert severity="info" className="catalog-empty-alert">
          Ingen produkter matcher din søgning.
        </Alert>
      ) : (
        <div className="catalog-product-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="catalog-product-card produkter-product-card">
              {product.sold && <span className="catalog-product-badge">Solgt</span>}

              <div className="catalog-product-image-wrap">
                <Link
                  href={`/products/${product.id}`}
                  className="catalog-product-link"
                  aria-label={`Gå til ${product.title}`}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title ?? "Produkt"}
                      className="catalog-product-image"
                    />
                  ) : (
                    <div className="catalog-product-image catalog-product-image--placeholder" />
                  )}
                </Link>
              </div>

              <div className="catalog-product-info">
                <span className="catalog-product-name">{product.title}</span>
                {product.price != null && (
                  <span className="catalog-product-price">{product.price.toFixed(0)} kr</span>
                )}
              </div>

              <div className="produkter-card-actions">
                <Button
                  component={Link}
                  href={`/edit/${product.id}`}
                  className="produkter-edit-button"
                >
                  Rediger
                </Button>
                <Button
                  className="produkter-delete-button"
                  onClick={() => openDeleteDialog(product.id)}
                >
                  Slet
                </Button>
              </div>
            </article>
          ))}
        </div>
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

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        className="produkter-dialog"
        PaperProps={{ className: "produkter-dialog-paper" }}
      >
        <DialogTitle className="produkter-dialog-title">Bekræft sletning</DialogTitle>
        <DialogContent>
          <p className="produkter-dialog-copy">
            Er du sikker på, at du vil slette produktet? Handlingen kan ikke fortrydes.
          </p>
        </DialogContent>
        <DialogActions className="produkter-dialog-actions">
          <Button onClick={() => setOpenDialog(false)} className="produkter-dialog-cancel">
            Fortryd
          </Button>
          <Button onClick={deleteProdukt} className="produkter-dialog-delete">
            Slet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
