"use client";

import { Box, Button, Chip } from "@mui/material";
import {
  getCategoryLabel,
  getFacetOptionLabel,
  getFacetOptions,
  getFacetsForFilter,
  SHOP_FACET_LABELS,
  type ActiveShopFacets,
  type ShopFacetKey,
  type ShopProduct,
} from "@/app/lib/shopFilters";
import type { Filter } from "@/app/utils/filterStyles";

interface CatalogFilterDrawerProps {
  activeFilter: Filter;
  visibleProducts: ShopProduct[];
  activeFacets: ActiveShopFacets;
  onFacetToggle: (facet: ShopFacetKey, value: string) => void;
  onClear: () => void;
  onClose: () => void;
  resultCount: number;
}

export default function CatalogFilterDrawer({
  activeFilter,
  visibleProducts,
  activeFacets,
  onFacetToggle,
  onClear,
  onClose,
  resultCount,
}: CatalogFilterDrawerProps) {
  const facets = getFacetsForFilter(activeFilter);
  const categoryLabel = getCategoryLabel(activeFilter);

  const facetSections = facets
    .map((facet) => ({
      facet,
      values: getFacetOptions(visibleProducts, facet),
    }))
    .filter((section) => section.values.length > 0);

  return (
    <Box className="shop-filter-drawer-inner">
      <Box className="shop-filter-drawer-top">
        <div className="shop-filter-drawer-heading">
          <p className="shop-filter-drawer-kicker">Filtrer</p>
          {categoryLabel && (
            <p className="shop-filter-drawer-category">{categoryLabel}</p>
          )}
        </div>
        <Button onClick={onClose} className="shop-filter-drawer-close">
          Luk
        </Button>
      </Box>

      {activeFilter === "all" && facetSections.length === 0 && (
        <p className="shop-filter-hint">
          Ingen filtre tilgængelige for de viste produkter endnu.
        </p>
      )}

      {facetSections.map(({ facet, values }) => (
        <div key={facet} className="shop-filter-section">
          <p className="shop-advanced-filter-title">{SHOP_FACET_LABELS[facet]}</p>
          <Box className="shop-filter-chip-grid">
            {values.map((value) => {
              const isActive = activeFacets[facet]?.includes(value) ?? false;

              return (
                <Chip
                  key={`${facet}-${value}`}
                  label={getFacetOptionLabel(facet, value)}
                  clickable
                  onClick={() => onFacetToggle(facet, value)}
                  className={`shop-filter-chip${isActive ? " is-active" : ""}`}
                />
              );
            })}
          </Box>
        </div>
      ))}

      <Box className="shop-filter-drawer-actions">
        <Button onClick={onClear} className="shop-filter-reset-button">
          Nulstil
        </Button>
        <Button onClick={onClose} className="shop-filter-apply-button">
          Vis produkter ({resultCount})
        </Button>
      </Box>
    </Box>
  );
}
