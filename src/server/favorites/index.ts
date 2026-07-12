import { parseProductId, serializeProduct } from "@/app/lib/productSerialize";
import { prisma } from "@/server/db/prisma";
import type { Product } from "@prisma/client";

export async function listFavoriteProductIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });

  return favorites
    .map((favorite) => favorite.productId?.toString())
    .filter((id): id is string => Boolean(id));
}

export async function listFavoriteProducts(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites
    .map((favorite) => favorite.product)
    .filter((product): product is Product => product != null)
    .map(serializeProduct);
}

export async function isFavorite(userId: string, productId: string) {
  const id = parseProductId(productId);
  const favorite = await prisma.favorite.findFirst({
    where: { userId, productId: id },
  });

  return Boolean(favorite);
}

export async function addFavorite(userId: string, productId: string) {
  const id = parseProductId(productId);
  const existing = await prisma.favorite.findFirst({
    where: { userId, productId: id },
  });

  if (existing) return;

  await prisma.favorite.create({
    data: {
      userId,
      productId: id,
    },
  });
}

export async function removeFavorite(userId: string, productId: string) {
  const id = parseProductId(productId);
  await prisma.favorite.deleteMany({
    where: { userId, productId: id },
  });
}
