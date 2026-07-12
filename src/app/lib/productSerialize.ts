import type { Product, ProductImage } from "@prisma/client";

export type ProductImageDto = {
  id: string;
  image_url: string;
  position: number;
};

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
  images?: ProductImageDto[];
};

type ProductWithImages = Product & { images?: ProductImage[] };

export function parseProductId(id: string): bigint {
  if (!/^\d+$/.test(id)) {
    throw new Error("Ugyldigt produkt-id");
  }
  return BigInt(id);
}

export function serializeProduct(product: ProductWithImages): ProductDto {
  const dto: ProductDto = {
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

  if (product.images) {
    dto.images = product.images.map((image) => ({
      id: image.id.toString(),
      image_url: image.imageUrl,
      position: image.position,
    }));
  }

  return dto;
}
