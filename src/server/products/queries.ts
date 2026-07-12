import { prisma } from "@/server/db/prisma";
import { parseProductId, serializeProduct } from "@/server/products/serialize";

export async function listProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return products.map(serializeProduct);
}

export async function getProductById(id: string) {
  const productId = parseProductId(id);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { position: "asc" } },
    },
  });
  return product ? serializeProduct(product) : null;
}

export async function listProductsByUser(userId: string) {
  const products = await prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return products.map(serializeProduct);
}
