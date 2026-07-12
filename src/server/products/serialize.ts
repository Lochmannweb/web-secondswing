import type { Product } from "@prisma/client";

export type ProductDto = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
  sold: boolean | null;
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
  product_images?: Array<{ image_url: string; position: number }>;
};

type ProductRecord = Product & {
  images?: Array<{ imageUrl: string; position: number }>;
};

export function serializeProduct(product: ProductRecord): ProductDto {
  return {
    id: product.id,
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
    product_images: product.images?.map((img) => ({
      image_url: img.imageUrl,
      position: img.position,
    })),
  };
}
