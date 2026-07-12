/** Klient-lag: kalder Prisma API — al data håndteres server-side via /api/* */

import type { ProductDto } from "@/server/products/serialize";

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
  return parseJson(response);
}

export async function getProduct() {
  const response = await fetch("/api/products", { cache: "no-store" });
  return parseJson<Awaited<ReturnType<typeof import("@/server/products").listProducts>>>(response);
}

export async function updateProduct(id: string, updates: Record<string, unknown>) {
  const response = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return parseJson(response);
}

export async function deleteProduct(id: string) {
  const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
  return parseJson(response);
}

export async function getProductById(id: string): Promise<ProductDto> {
  const response = await fetch(`/api/products/${id}`, { cache: "no-store" });
  return parseJson<ProductDto>(response);
}
