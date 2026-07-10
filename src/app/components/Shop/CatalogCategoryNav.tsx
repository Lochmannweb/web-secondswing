"use client";

import { CATEGORY_OPTIONS } from "@/app/lib/productForm";
import type { ProductCategory } from "@/app/lib/productForm";
import { resolveProductCategory } from "@/app/lib/shopFilters";
import type { ShopProduct } from "@/app/lib/shopFilters";
import type { Filter } from "@/app/utils/filterStyles";

interface CatalogCategoryNavProps {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  products: ShopProduct[];
  userId: string | null;
}

export default function CatalogCategoryNav({
  activeFilter,
  onFilterChange,
  products,
  userId,
}: CatalogCategoryNavProps) {
  const visibleProducts = userId
    ? products.filter((product) => product.user_id !== userId)
    : products;

  const getCount = (filter: Filter) => {
    if (filter === "all") return visibleProducts.length;
    return visibleProducts.filter(
      (product) => resolveProductCategory(product) === filter
    ).length;
  };

  return (
    <nav className="catalog-category-nav" aria-label="Kategorier">
      <button
        type="button"
        className={`catalog-category-link catalog-category-show-all${
          activeFilter === "all" ? " is-active" : ""
        }`}
        onClick={() => onFilterChange("all")}
      >
        Vis alle
      </button>

      <div className="catalog-category-list">
        {CATEGORY_OPTIONS.map((category) => {
          const count = getCount(category.value as Filter);
          if (count === 0) return null;

          return (
            <button
              key={category.value}
              type="button"
              className={`catalog-category-link${
                activeFilter === category.value ? " is-active" : ""
              }`}
              onClick={() => onFilterChange(category.value as Filter)}
            >
              {category.label}
              <sup>{count}</sup>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
