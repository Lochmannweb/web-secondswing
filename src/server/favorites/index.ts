import { prisma } from "@/server/db/prisma";
import { serializeProduct } from "@/server/products/serialize";
import { ensureProfile } from "@/server/profiles/queries";

export async function listFavoriteProductIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });

  return favorites.map((favorite) => favorite.productId);
}

export async function listFavoriteProducts(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: { product: { createdAt: "desc" } },
  });

  return favorites.map((favorite) => serializeProduct(favorite.product));
}

export async function isFavorite(userId: string, productId: string) {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  return Boolean(favorite);
}

export async function addFavorite(userId: string, productId: string) {
  await ensureProfile(userId);

  await prisma.favorite.upsert({
    where: {
      userId_productId: { userId, productId },
    },
    update: {},
    create: {
      userId,
      productId,
    },
  });
}

export async function removeFavorite(userId: string, productId: string) {
  await prisma.favorite.deleteMany({
    where: { userId, productId },
  });
}
