import type { ProductCategory } from "@/app/lib/productForm";
import { CATEGORY_OPTIONS, inferProductCategory, PRODUCT_CATEGORIES } from "@/app/lib/productForm";
import type { Filter } from "@/app/utils/filterStyles";

export type ShopFacetKey =
  | "gender"
  | "color"
  | "size"
  | "stand"
  | "brand"
  | "club_type"
  | "flex"
  | "hand"
  | "divider_count"
  | "weight";

export const SHOP_FACET_LABELS: Record<ShopFacetKey, string> = {
  gender: "Køn",
  color: "Farve",
  size: "Størrelse",
  stand: "Tilstand",
  brand: "Brand",
  club_type: "Type",
  flex: "Flex",
  hand: "Hånd",
  divider_count: "Divider antal",
  weight: "Vægt",
};

export const CATEGORY_SHOP_FACETS: Record<ProductCategory, ShopFacetKey[]> = {
  clothing: ["gender", "size", "color", "stand"],
  shoes: ["gender", "size", "color", "stand"],
  clubs: ["brand", "club_type", "color", "flex", "hand", "stand"],
  bags: ["brand", "color", "divider_count", "stand"],
  gloves: ["brand", "size", "color", "stand"],
  accessories: ["brand", "color", "stand"],
  other: ["brand", "color", "stand"],
};

export const ALL_VIEW_FACETS: ShopFacetKey[] = [
  "brand",
  "club_type",
  "color",
  "gender",
  "size",
  "stand",
];

export type ShopProduct = {
  user_id: string;
  category?: string | null;
  gender?: string | null;
  color?: string | null;
  size?: string | null;
  stand?: string | null;
  brand?: string | null;
  club_type?: string | null;
  flex?: string | null;
  hand?: string | null;
  divider_count?: number | null;
  weight?: string | null;
  title?: string | null;
};

export type ActiveShopFacets = Partial<Record<ShopFacetKey, string[]>>;

const VALUE_LABELS: Record<string, Record<string, string>> = {
  gender: {
    female: "Kvinde",
    male: "Mand",
    unisex: "Unisex",
  },
  hand: {
    Left: "Venstre",
    Right: "Højre",
  },
};

export function getFacetsForFilter(filter: Filter): ShopFacetKey[] {
  if (filter === "all") {
    return ALL_VIEW_FACETS;
  }

  return CATEGORY_SHOP_FACETS[filter];
}

export function getCategoryLabel(filter: Filter): string | null {
  if (filter === "all") return null;
  return CATEGORY_OPTIONS.find((option) => option.value === filter)?.label ?? null;
}

export function normalizeFacetValue(value: string | number | null | undefined) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getProductFacetValue(
  product: ShopProduct,
  facet: ShopFacetKey
): string | null {
  return normalizeFacetValue(product[facet]);
}

export function getFacetOptionLabel(facet: ShopFacetKey, value: string) {
  return VALUE_LABELS[facet]?.[value] ?? value;
}

export function resolveProductCategory(product: ShopProduct): ProductCategory {
  if (product.category && PRODUCT_CATEGORIES.includes(product.category as ProductCategory)) {
    return product.category as ProductCategory;
  }

  return inferProductCategory(product);
}

export function getVisibleProducts(
  products: ShopProduct[],
  userId: string | null,
  activeFilter: Filter
) {
  let results = [...products];
  if (userId) results = results.filter((product) => product.user_id !== userId);
  if (activeFilter !== "all") {
    results = results.filter(
      (product) => resolveProductCategory(product) === activeFilter
    );
  }
  return results;
}

export function getFacetOptions(
  products: ShopProduct[],
  facet: ShopFacetKey
): string[] {
  return Array.from(
    new Set(
      products
        .map((product) => getProductFacetValue(product, facet))
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b, "da"));
}

export function pruneActiveFacets(
  activeFacets: ActiveShopFacets,
  allowedFacets: ShopFacetKey[]
): ActiveShopFacets {
  const allowed = new Set(allowedFacets);
  const next: ActiveShopFacets = {};

  for (const facet of allowed) {
    const values = activeFacets[facet];
    if (values && values.length > 0) {
      next[facet] = values;
    }
  }

  return next;
}

export function applyShopFilters<T extends ShopProduct>(
  products: T[],
  options: {
    userId: string | null;
    activeFilter: Filter;
    searchQuery: string;
    activeFacets: ActiveShopFacets;
  }
): T[] {
  let results = getVisibleProducts(products, options.userId, options.activeFilter) as T[];

  if (options.searchQuery.trim()) {
    const normalizedQuery = options.searchQuery.toLowerCase();
    results = results.filter((product) =>
      (product.title ?? "").toLowerCase().includes(normalizedQuery)
    );
  }

  for (const [facet, values] of Object.entries(options.activeFacets) as [
    ShopFacetKey,
    string[],
  ][]) {
    if (!values || values.length === 0) continue;

    results = results.filter((product) => {
      const value = getProductFacetValue(product, facet);
      return value ? values.includes(value) : false;
    });
  }

  return results;
}

export function countActiveFacets(
  activeFacets: ActiveShopFacets,
  searchQuery: string
) {
  const facetCount = Object.values(activeFacets).reduce(
    (total, values) => total + (values?.length ?? 0),
    0
  );

  return facetCount + (searchQuery.trim().length > 0 ? 1 : 0);
}
