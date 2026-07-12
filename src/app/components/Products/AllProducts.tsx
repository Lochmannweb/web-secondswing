"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButton, Alert } from "@mui/material";
import { addFavorite, listFavoriteProductIds, removeFavorite } from "@/app/lib/favoritesApi";
import { getSupabaseClient } from "@/app/lib/supabaseClient";

interface Product {
  id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  gender: string | null;
  category?: string | null;
  color?: string | null;
  size?: string | null;
  stand?: string | null;
  brand?: string | null;
  club_type?: string | null;
  flex?: string | null;
  hand?: string | null;
  divider_count?: number | null;
  weight?: string | null;
  sold: boolean | null;
}

interface AllProductsProps {
  products: Product[];
  onFavoriteRemoved?: (productId: string) => void;
}

export default function AllProducts({ products, onFavoriteRemoved }: AllProductsProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setUserId(null);
        setFavorites([]);
        return;
      }
      setUserId(userData.user.id);

      const favData = await listFavoriteProductIds(userData.user.id);
      setFavorites(favData);
    };
    fetchFavorites();
  }, [supabase]);

  const toggleFavorite = async (productId: string) => {
    if (!userId) return;

    try {
      if (favorites.includes(productId)) {
        setFavorites(favorites.filter((id) => id !== productId));
        await removeFavorite(userId, productId);
        onFavoriteRemoved?.(productId);
      } else {
        setFavorites([...favorites, productId]);
        await addFavorite(userId, productId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!products || products.length === 0) {
    return (
      <Alert severity="info" className="catalog-empty-alert">
        Ingen produkter matcher din søgning endnu.
      </Alert>
    );
  }

  return (
    <div className="catalog-product-grid">
      {products.map((product) => (
        <article key={product.id} className="catalog-product-card">
          {product.sold && (
            <span className="catalog-product-badge">Solgt</span>
          )}

          <div className="catalog-product-image-wrap">
            {userId && (
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className="catalog-favorite-button"
                aria-label="Tilføj til favoritter"
              >
                {favorites.includes(product.id) ? (
                  <FavoriteIcon />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
            )}

            <Link
              href={`/products/${product.id}`}
              className="catalog-product-link"
              aria-label={`Gå til ${product.title}`}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title ?? "Produkt"}
                  className="catalog-product-image"
                />
              ) : (
                <div className="catalog-product-image catalog-product-image--placeholder" />
              )}
            </Link>
          </div>

          <div className="catalog-product-info">
            <span className="catalog-product-name">{product.title}</span>
            {product.price != null && (
              <span className="catalog-product-price">
                {product.price.toFixed(0)} kr
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
