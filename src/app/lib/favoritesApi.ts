async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Request fejlede");
  }
  return payload;
}

export async function listFavoriteProductIds(userId: string): Promise<string[]> {
  const response = await fetch(`/api/favorites?user_id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  return parseJson<string[]>(response);
}

export async function listFavoriteProducts(userId: string) {
  const response = await fetch(
    `/api/favorites?user_id=${encodeURIComponent(userId)}&with_products=1`,
    { cache: "no-store" }
  );
  return parseJson<Awaited<ReturnType<typeof import("@/server/favorites").listFavoriteProducts>>>(
    response
  );
}

export async function addFavorite(userId: string, productId: string) {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, product_id: productId }),
  });
  return parseJson(response);
}

export async function removeFavorite(userId: string, productId: string) {
  const response = await fetch(
    `/api/favorites?user_id=${encodeURIComponent(userId)}&product_id=${encodeURIComponent(productId)}`,
    { method: "DELETE" }
  );
  return parseJson(response);
}

export async function checkFavorite(userId: string, productId: string): Promise<boolean> {
  const response = await fetch(
    `/api/favorites/check?user_id=${encodeURIComponent(userId)}&product_id=${encodeURIComponent(productId)}`,
    { cache: "no-store" }
  );
  const payload = await parseJson<{ is_favorite: boolean }>(response);
  return payload.is_favorite;
}
