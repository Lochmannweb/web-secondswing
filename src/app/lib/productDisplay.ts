type ProductDisplayData = {
  category?: string | null
  gender?: string | null
  color?: string | null
  size?: string | null
  stand?: string | null
  brand?: string | null
  club_type?: string | null
  flex?: string | null
  hand?: string | null
  divider_count?: number | string | null
  weight?: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  clothing: "Toj",
  shoes: "Sko",
  clubs: "Golfkolle",
  bags: "Golftaske",
  gloves: "Handsker",
  accessories: "Accessories",
  other: "Andet",
}

const GENDER_LABELS: Record<string, string> = {
  female: "Kvinde",
  male: "Mand",
  unisex: "Unisex",
}

const normalized = (value: unknown) => {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim()
}

const pushUnique = (items: string[], value: string) => {
  if (!value || items.includes(value)) {
    return
  }

  items.push(value)
}

export function getCategoryLabel(category?: string | null) {
  if (!category) {
    return "Andet"
  }

  return CATEGORY_LABELS[category] ?? "Andet"
}

export function getProductListMeta(product: ProductDisplayData, limit = 3) {
  const category = normalized(product.category)
  const categoryLabel = getCategoryLabel(category)
  const gender = normalized(product.gender)
  const color = normalized(product.color)
  const size = normalized(product.size)
  const stand = normalized(product.stand)
  const brand = normalized(product.brand)
  const clubType = normalized(product.club_type)
  const flex = normalized(product.flex)
  const hand = normalized(product.hand)
  const weight = normalized(product.weight)
  const dividerCount = product.divider_count != null ? String(product.divider_count).trim() : ""

  const meta: string[] = []
  pushUnique(meta, categoryLabel)

  if (category === "clubs") {
    pushUnique(meta, brand)
    pushUnique(meta, clubType)
    pushUnique(meta, flex)
    pushUnique(meta, hand)
  } else if (category === "bags") {
    pushUnique(meta, brand)
    if (dividerCount) {
      pushUnique(meta, `${dividerCount} divider`)
    }
    pushUnique(meta, weight)
  } else {
    pushUnique(meta, GENDER_LABELS[gender] ?? "")
    pushUnique(meta, size)
    pushUnique(meta, color)
  }

  pushUnique(meta, stand)
  return meta.slice(0, limit)
}

export function getProductDetailMeta(product: ProductDisplayData) {
  const rows: Array<{ key: string; value: string }> = []
  const category = normalized(product.category)
  const gender = normalized(product.gender)
  const color = normalized(product.color)
  const size = normalized(product.size)
  const stand = normalized(product.stand)
  const brand = normalized(product.brand)
  const clubType = normalized(product.club_type)
  const flex = normalized(product.flex)
  const hand = normalized(product.hand)
  const weight = normalized(product.weight)
  const dividerCount = product.divider_count != null ? String(product.divider_count).trim() : ""

  rows.push({ key: "kategori", value: getCategoryLabel(category) })

  if (category === "clubs") {
    if (brand) rows.push({ key: "brand", value: `Brand: ${brand}` })
    if (clubType) rows.push({ key: "type", value: `Type: ${clubType}` })
    if (flex) rows.push({ key: "flex", value: `Flex: ${flex}` })
    if (hand) rows.push({ key: "hand", value: `Hand: ${hand}` })
  } else if (category === "bags") {
    if (brand) rows.push({ key: "brand", value: `Brand: ${brand}` })
    if (dividerCount) rows.push({ key: "dividers", value: `Dividere: ${dividerCount}` })
    if (weight) rows.push({ key: "weight", value: `Vaegt: ${weight}` })
  } else {
    const genderLabel = GENDER_LABELS[gender]
    if (genderLabel) rows.push({ key: "gender", value: `Kon: ${genderLabel}` })
    if (size) rows.push({ key: "size", value: `Storrelse: ${size}` })
    if (color) rows.push({ key: "color", value: `Farve: ${color}` })
  }

  if (stand) {
    rows.push({ key: "stand", value: `Tilstand: ${stand}` })
  }

  return rows
}