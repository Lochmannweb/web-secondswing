import type { Product } from "@prisma/client";

export type ProductDto = {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
  sold: boolean;
  gender: string | null;
  color: string | null;
  size: string | null;
  stand: string | null;
  category: string | null;
  brand: string | null;
  club_type: string | null;
  flex: string | null;
  hand: string | null;
  divider_count: number | null;
  weight: string | null;
};

export function parseProductId(id: string): bigint {
  if (!/^\d+$/.test(id)) {
    throw new Error("Ugyldigt produkt-id");
  }
  return BigInt(id);
}

export function serializeProduct(product: Product): ProductDto {
  return {
    id: product.id.toString(),
    user_id: product.userId,
    title: product.title,
    description: product.description,
    price: product.price != null ? Number(product.price) : null,
    image_url: product.imageUrl,
    created_at: product.createdAt.toISOString(),
    sold: product.sold,
    gender: product.gender,
    color: product.color,
    size: product.size,
    stand: product.stand,
    category: product.category,
    brand: product.brand,
    club_type: product.clubType,
    flex: product.flex,
    hand: product.hand,
    divider_count: product.dividerCount,
    weight: product.weight,
  };
}
