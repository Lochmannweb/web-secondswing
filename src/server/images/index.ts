import { prisma } from "@/server/db/prisma";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function imagePublicUrl(id: string): string {
  return `/api/images/${id}`;
}

export async function createImage(mimeType: string, data: Buffer | Uint8Array) {
  if (data.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("Billedet er for stort (max 5 MB).");
  }

  const image = await prisma.image.create({
    data: {
      mimeType,
      data: Buffer.from(data),
    },
  });

  return {
    id: image.id,
    url: imagePublicUrl(image.id),
  };
}

export async function getImageById(id: string) {
  return prisma.image.findUnique({ where: { id } });
}
