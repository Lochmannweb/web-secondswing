import { prisma } from "@/server/db/prisma";
import { serializeProduct } from "@/server/products/serialize";

export async function listProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return products.map(serializeProduct);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
    },
  });
  return product ? serializeProduct(product) : null;
}
