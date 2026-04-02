export const PRODUCT_CATEGORIES = [
  "clothing",
  "shoes",
  "clubs",
  "bags",
  "gloves",
  "accessories",
  "other",
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export type ProductFormState = {
  category: ProductCategory | ""
  title: string
  description: string
  price: string
  gender: string
  color: string
  size: string
  stand: string
  brand: string
  club_type: string
  flex: string
  hand: string
  divider_count: string
  weight: string
  image_url?: string | null
}

export type ProductFieldKey = Exclude<keyof ProductFormState, "image_url">

export type ProductOption = {
  value: string
  label: string
}

export type ProductFieldDefinition = {
  key: ProductFieldKey
  label: string
  kind: "text" | "number" | "select"
  options?: ProductOption[]
}

export const CATEGORY_OPTIONS: ProductOption[] = [
  { value: "clothing", label: "Tøj" },
  { value: "shoes", label: "Sko" },
  { value: "clubs", label: "Golfkølle" },
  { value: "bags", label: "Golftaske" },
  { value: "gloves", label: "Handsker" },
  { value: "accessories", label: "Accessories" },
  { value: "other", label: "Andet" },
]

export const STAND_OPTIONS: ProductOption[] = [
  { value: "Nyt", label: "Nyt" },
  { value: "Brugt", label: "Brugt" },
  { value: "Brugspor", label: "Brugspor" },
]

export const GENDER_OPTIONS: ProductOption[] = [
  { value: "female", label: "Kvinde" },
  { value: "male", label: "Mand" },
]

export const COLOR_OPTIONS: ProductOption[] = [
  { value: "Sort", label: "Sort" },
  { value: "Hvid", label: "Hvid" },
  { value: "Gra", label: "Gra" },
  { value: "Bla", label: "Bla" },
  { value: "Rod", label: "Rod" },
  { value: "Gron", label: "Gron" },
  { value: "Navy", label: "Navy" },
]

export const CLOTHING_SIZE_OPTIONS: ProductOption[] = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
]

export const SHOE_SIZE_OPTIONS: ProductOption[] = Array.from({ length: 9 }, (_, index) => {
  const euSize = 40 + index

  return {
    value: `EU ${euSize}`,
    label: `EU ${euSize}`,
  }
})

export const CLUB_TYPE_OPTIONS: ProductOption[] = [
  { value: "Driver", label: "Driver" },
  { value: "Iron", label: "Iron" },
  { value: "Putter", label: "Putter" },
]

export const FLEX_OPTIONS: ProductOption[] = [
  { value: "Stiff", label: "Stiff" },
  { value: "Regular", label: "Regular" },
]

export const HAND_OPTIONS: ProductOption[] = [
  { value: "Left", label: "Left" },
  { value: "Right", label: "Right" },
]

const CATEGORY_FIELD_DEFINITIONS: Record<ProductCategory, ProductFieldDefinition[]> = {
  clothing: [
    { key: "gender", label: "Kon", kind: "select", options: GENDER_OPTIONS },
    { key: "size", label: "Storrelse", kind: "select", options: CLOTHING_SIZE_OPTIONS },
    { key: "color", label: "Farve", kind: "select", options: COLOR_OPTIONS },
  ],
  shoes: [
    { key: "gender", label: "Kon", kind: "select", options: GENDER_OPTIONS },
    { key: "size", label: "Storrelse", kind: "select", options: SHOE_SIZE_OPTIONS },
    { key: "color", label: "Farve", kind: "select", options: COLOR_OPTIONS },
  ],
  clubs: [
    { key: "brand", label: "Brand", kind: "text" },
    { key: "club_type", label: "Type", kind: "select", options: CLUB_TYPE_OPTIONS },
    { key: "flex", label: "Flex", kind: "select", options: FLEX_OPTIONS },
    { key: "hand", label: "Hand", kind: "select", options: HAND_OPTIONS },
  ],
  bags: [
    { key: "brand", label: "Brand", kind: "text" },
    { key: "divider_count", label: "Divider antal", kind: "number" },
    { key: "weight", label: "Vaegt", kind: "text" },
  ],
  gloves: [],
  accessories: [],
  other: [],
}

const COMMON_REQUIRED_FIELDS: ProductFieldKey[] = [
  "category",
  "title",
  "description",
  "price",
  "stand",
]

const CATEGORY_REQUIRED_FIELDS: Record<ProductCategory, ProductFieldKey[]> = {
  clothing: ["gender", "size", "color"],
  shoes: ["gender", "size", "color"],
  clubs: ["brand", "club_type", "flex", "hand"],
  bags: ["brand", "divider_count", "weight"],
  gloves: [],
  accessories: [],
  other: [],
}

export function createEmptyProductForm(overrides: Partial<ProductFormState> = {}): ProductFormState {
  return {
    category: "",
    title: "",
    description: "",
    price: "",
    gender: "",
    color: "",
    size: "",
    stand: "",
    brand: "",
    club_type: "",
    flex: "",
    hand: "",
    divider_count: "",
    weight: "",
    image_url: null,
    ...overrides,
  }
}

export function getCategoryFields(category: ProductCategory | ""): ProductFieldDefinition[] {
  if (!category) {
    return []
  }

  return CATEGORY_FIELD_DEFINITIONS[category]
}

export function getRequiredProductFields(category: ProductCategory | ""): ProductFieldKey[] {
  if (!category) {
    return COMMON_REQUIRED_FIELDS
  }

  return [...COMMON_REQUIRED_FIELDS, ...CATEGORY_REQUIRED_FIELDS[category]]
}

function normalizeValue(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function buildProductPayload(form: ProductFormState) {
  const payload = {
    category: form.category || null,
    title: normalizeValue(form.title),
    description: normalizeValue(form.description),
    price: form.price.trim() ? Number(form.price) : null,
    stand: normalizeValue(form.stand),
    gender: null as string | null,
    color: null as string | null,
    size: null as string | null,
    brand: null as string | null,
    club_type: null as string | null,
    flex: null as string | null,
    hand: null as string | null,
    divider_count: null as number | null,
    weight: null as string | null,
  }

  if (form.category === "clothing" || form.category === "shoes") {
    payload.gender = normalizeValue(form.gender)
    payload.color = normalizeValue(form.color)
    payload.size = normalizeValue(form.size)
  }

  if (form.category === "clubs") {
    payload.brand = normalizeValue(form.brand)
    payload.club_type = normalizeValue(form.club_type)
    payload.flex = normalizeValue(form.flex)
    payload.hand = normalizeValue(form.hand)
  }

  if (form.category === "bags") {
    payload.brand = normalizeValue(form.brand)
    payload.divider_count = form.divider_count.trim() ? Number(form.divider_count) : null
    payload.weight = normalizeValue(form.weight)
  }

  return payload
}

export function isProductFormComplete(form: ProductFormState, imageCount: number) {
  const priceValue = Number(form.price)

  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return false
  }

  return getRequiredProductFields(form.category).every((fieldKey) => {
    const value = form[fieldKey]

    return typeof value === "string" && value.trim().length > 0
  }) && imageCount > 0
}

export function inferProductCategory(product: Partial<Record<string, unknown>>): ProductCategory {
  const category = product.category

  if (typeof category === "string" && PRODUCT_CATEGORIES.includes(category as ProductCategory)) {
    return category as ProductCategory
  }

  if (product.club_type || product.flex || product.hand) {
    return "clubs"
  }

  if (product.divider_count || product.weight) {
    return "bags"
  }

  if (product.size && typeof product.size === "string" && product.size.startsWith("EU ")) {
    return "shoes"
  }

  return "clothing"
}

export function toProductFormState(product: Partial<Record<string, unknown>>): ProductFormState {
  return createEmptyProductForm({
    category: inferProductCategory(product),
    title: typeof product.title === "string" ? product.title : "",
    description: typeof product.description === "string" ? product.description : "",
    price: product.price != null ? String(product.price) : "",
    gender: typeof product.gender === "string" ? product.gender : "",
    color: typeof product.color === "string" ? product.color : "",
    size: typeof product.size === "string" ? product.size : "",
    stand: typeof product.stand === "string" ? product.stand : "",
    brand: typeof product.brand === "string" ? product.brand : "",
    club_type: typeof product.club_type === "string" ? product.club_type : "",
    flex: typeof product.flex === "string" ? product.flex : "",
    hand: typeof product.hand === "string" ? product.hand : "",
    divider_count: product.divider_count != null ? String(product.divider_count) : "",
    weight: typeof product.weight === "string" ? product.weight : "",
    image_url: typeof product.image_url === "string" ? product.image_url : null,
  })
}