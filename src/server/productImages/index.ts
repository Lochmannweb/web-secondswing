import { parseProductId } from "@/app/lib/productSerialize";
import { prisma } from "@/server/db/prisma";

export type ProductImageDto = {
  id: string;
  image_url: string;
  position: number;
};

function serializeProductImage(image: {
  id: bigint;
  imageUrl: string;
  position: number;
}): ProductImageDto {
  return {
    id: image.id.toString(),
    image_url: image.imageUrl,
    position: image.position,
  };
}

export async function listProductImages(productId: string): Promise<ProductImageDto[]> {
  const id = parseProductId(productId);
  const images = await prisma.productImage.findMany({
    where: { productId: id },
    orderBy: { position: "asc" },
  });

  return images.map(serializeProductImage);
}

export async function replaceProductImages(
  productId: string,
  images: Array<{ image_url: string; position: number }>
) {
  const id = parseProductId(productId);
  await prisma.productImage.deleteMany({ where: { productId: id } });

  if (!images.length) return [];

  const created = await prisma.$transaction(
    images.map((image) =>
      prisma.productImage.create({
        data: {
          productId: id,
          imageUrl: image.image_url,
          position: image.position,
        },
      })
    )
  );

  return created.map(serializeProductImage);
}

export async function deleteProductImages(productId: string) {
  const id = parseProductId(productId);
  await prisma.productImage.deleteMany({ where: { productId: id } });
}
