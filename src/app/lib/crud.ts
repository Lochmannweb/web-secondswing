/** Klient-lag: produkter håndteres via Prisma API (server-side). */

import type { ProductDto, ProductImageDto } from "@/app/lib/productSerialize";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Request fejlede");
  }
  return payload;
}

export async function createProduct(product: Record<string, unknown>) {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return parseJson<ProductDto>(response);
}

export async function getProduct() {
  const response = await fetch("/api/products", { cache: "no-store" });
  return parseJson<ProductDto[]>(response);
}

export async function getProductsByUser(userId: string) {
  const response = await fetch(`/api/products?user_id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  return parseJson<ProductDto[]>(response);
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [] as ProductDto[];
  const response = await fetch(`/api/products?ids=${encodeURIComponent(ids.join(","))}`, {
    cache: "no-store",
  });
  return parseJson<ProductDto[]>(response);
}

export async function getProductById(id: string) {
  const response = await fetch(`/api/products/${id}`, { cache: "no-store" });
  return parseJson<ProductDto>(response);
}

export async function updateProduct(id: string, updates: Record<string, unknown>) {
  const response = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return parseJson<ProductDto>(response);
}

export async function deleteProduct(id: string) {
  const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
  return parseJson<{ ok: boolean }>(response);
}

export async function getProductImages(productId: string) {
  const response = await fetch(`/api/products/${productId}/images`, { cache: "no-store" });
  return parseJson<ProductImageDto[]>(response);
}

export async function replaceProductImages(
  productId: string,
  images: Array<{ image_url: string; position: number }>
) {
  const response = await fetch(`/api/products/${productId}/images`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images }),
  });
  return parseJson<ProductImageDto[]>(response);
}
