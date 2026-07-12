import { prisma } from "@/server/db/prisma";
import { parseProductId, serializeProduct } from "@/server/products/serialize";
import type { Prisma } from "@prisma/client";

type ProductInput = {
  user_id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  category?: string;
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
  sold?: boolean;
  extra_images?: Array<{ image_url: string; position: number }>;
};

function toCreateData(input: ProductInput): Prisma.ProductCreateInput {
  return {
    title: input.title,
    description: input.description ?? null,
    price: input.price ?? null,
    imageUrl: input.image_url ?? null,
    category: input.category ?? "clothing",
    gender: input.gender ?? null,
    color: input.color ?? null,
    size: input.size ?? null,
    stand: input.stand ?? null,
    brand: input.brand ?? null,
    clubType: input.club_type ?? null,
    flex: input.flex ?? null,
    hand: input.hand ?? null,
    dividerCount: input.divider_count ?? null,
    weight: input.weight ?? null,
    sold: input.sold ?? false,
    userId: input.user_id,
    images: input.extra_images?.length
      ? {
          create: input.extra_images.map((img) => ({
            imageUrl: img.image_url,
            position: img.position,
          })),
        }
      : undefined,
  };
}

export async function createProduct(input: ProductInput) {
  const product = await prisma.product.create({
    data: toCreateData(input),
    include: { images: { orderBy: { position: "asc" } } },
  });
  return serializeProduct(product);
}

export async function updateProduct(id: string, updates: Partial<ProductInput>) {
  const productId = parseProductId(id);
  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      title: updates.title,
      description: updates.description,
      price: updates.price,
      imageUrl: updates.image_url,
      category: updates.category,
      gender: updates.gender,
      color: updates.color,
      size: updates.size,
      stand: updates.stand,
      brand: updates.brand,
      clubType: updates.club_type,
      flex: updates.flex,
      hand: updates.hand,
      dividerCount: updates.divider_count,
      weight: updates.weight,
      sold: updates.sold,
    },
    include: { images: { orderBy: { position: "asc" } } },
  });
  return serializeProduct(product);
}

export async function deleteProduct(id: string) {
  const productId = parseProductId(id);
  await prisma.product.delete({ where: { id: productId } });
}

export async function replaceProductImages(productId: string, imageUrls: string[]) {
  const id = parseProductId(productId);
  await prisma.productImage.deleteMany({ where: { productId: id } });

  const extras = imageUrls.slice(1);
  if (extras.length === 0) return;

  await prisma.productImage.createMany({
    data: extras.map((url, index) => ({
      productId: id,
      imageUrl: url,
      position: index + 1,
    })),
  });
}
