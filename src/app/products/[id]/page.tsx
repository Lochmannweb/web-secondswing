"use client";

import { getProductById, updateProduct } from "@/app/lib/crud";
import {
  addFavorite,
  checkFavorite,
  removeFavorite,
} from "@/app/lib/favoritesApi";
import { findOrCreateChat } from "@/app/lib/chatsApi";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import { getProductDetailMeta } from "@/app/lib/productDisplay";
import OfferBidDrawer from "@/app/components/Products/OfferBidDrawer";
import { Box, Button, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./productEdit.css";

interface Product {
  id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  image_url: string | null;
  user_id: string;
  color?: string | null;
  category?: string | null;
  gender?: string | null;
  stand?: string | null;
  size?: string | null;
  brand?: string | null;
  club_type?: string | null;
  flex?: string | null;
  hand?: string | null;
  divider_count?: number | null;
  weight?: string | null;
  sold: boolean | null;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const produktId = params.id as string | undefined;
  const supabase = getSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isOfferDrawerOpen, setIsOfferDrawerOpen] = useState(false);

  useEffect(() => {
    if (!produktId) {
      setError("Intet produkt id");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id ?? null;
        setViewerId(currentUserId);

        const data = await getProductById(produktId);
        setProduct(data);

        const initialImages = data.image_url ? [data.image_url] : [];
        const extraImages = data.images ?? [];
        const mergedImages = [
          ...initialImages,
          ...extraImages.map((item) => item.image_url).filter(Boolean),
        ];
        setProductImages(Array.from(new Set(mergedImages)));

        if (currentUserId) {
          const favorite = await checkFavorite(currentUserId, produktId);
          setIsFavorite(favorite);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Fejl ved hentning";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [produktId, supabase]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/products/${produktId}`,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  const toggleSoldStatus = async () => {
    if (!product || viewerId !== product.user_id) {
      return;
    }

    const nextSoldValue = !product.sold;

    if (!produktId) return;

    await updateProduct(produktId, { sold: nextSoldValue });
    setProduct({ ...product, sold: nextSoldValue });
  };

  const toggleFavorite = async () => {
    if (!product) return;

    if (!viewerId) {
      await handleGoogleLogin();
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(viewerId, product.id);
        setIsFavorite(false);
        return;
      }

      await addFavorite(viewerId, product.id);
      setIsFavorite(true);
    } catch {
      setError(isFavorite ? "Kunne ikke fjerne favorit" : "Kunne ikke gemme favorit");
    }
  };

  const openOrCreateChat = async () => {
    if (!viewerId) {
      await handleGoogleLogin();
      return;
    }

    if (!product || viewerId === product.user_id) {
      return;
    }

    setIsCreatingChat(true);

    try {
      const chat = await findOrCreateChat(viewerId, product.user_id);
      router.push(`/chats?chatId=${chat.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kunne ikke starte samtale";
      setError(msg);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const goToPreviousImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const openOfferDrawer = async () => {
    if (!viewerId) {
      await handleGoogleLogin();
      return;
    }

    if (!product || viewerId === product.user_id || product.sold) {
      return;
    }

    if (product.price == null) {
      setError("Produktet har ingen pris");
      return;
    }

    setIsOfferDrawerOpen(true);
  };

  const goToCheckout = async () => {
    if (!viewerId) {
      await handleGoogleLogin();
      return;
    }

    if (!product || viewerId === product.user_id || product.sold) {
      return;
    }

    router.push(`/products/${product.id}/checkout`);
  };

  const isOwner = product ? viewerId === product.user_id : false;
  const detailMeta = product ? getProductDetailMeta(product) : [];

  if (loading) {
    return <p className="product-page-status">Henter produkt...</p>;
  }
  if (error) {
    return <p className="product-page-status">{error}</p>;
  }
  if (!product) {
    return <p className="product-page-status">Produkt ikke fundet.</p>;
  }

  return (
    <Box className="product-page">
      <Box className="product-layout">
        <Box className="product-image-column">
          {product.sold ? <span className="product-sold-badge">Solgt</span> : null}

          {productImages.length > 0 ? (
            <>
              <Box className="product-image-stage">
                <Box
                  className="product-image-track"
                  sx={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                >
                  {productImages.map((imageUrl, index) => (
                    <Box key={`${imageUrl}-${index}`} className="product-image-slide">
                      <Image
                        src={imageUrl}
                        alt={`${product.title} ${index + 1}`}
                        fill
                        className="product-image"
                      />
                    </Box>
                  ))}
                </Box>

                {productImages.length > 1 ? (
                  <>
                    <IconButton
                      onClick={goToPreviousImage}
                      className="product-image-nav product-image-nav-prev"
                      aria-label="Forrige billede"
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                    <IconButton
                      onClick={goToNextImage}
                      className="product-image-nav product-image-nav-next"
                      aria-label="Næste billede"
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </>
                ) : null}
              </Box>

              {productImages.length > 1 ? (
                <Box className="product-image-dots">
                  {productImages.map((_, index) => (
                    <span
                      key={`product-image-dot-${index}`}
                      className={`product-image-dot${index === activeImageIndex ? " active" : ""}`}
                    />
                  ))}
                </Box>
              ) : null}
            </>
          ) : (
            <Box className="product-image-stage product-image-stage--empty" />
          )}
        </Box>

        <Box className="product-details">
          <div className="product-info-top">
            <h1 className="product-title">{product.title}</h1>
            {product.price != null ? (
              <p className="product-price">{product.price.toFixed(0)} kr</p>
            ) : null}
          </div>

          {product.description ? (
            <p className="product-description">{product.description}</p>
          ) : null}

          {detailMeta.length > 0 ? (
            <Box className="product-meta-list">
              {detailMeta.map((meta) => (
                <span key={meta.key} className="product-meta">
                  {meta.value}
                </span>
              ))}
            </Box>
          ) : null}

          <Box className="product-actions">
            {isOwner ? (
              <Button
                variant="contained"
                onClick={toggleSoldStatus}
                className="product-action-button"
              >
                {product.sold ? "Markér som ledig igen" : "Markér som solgt"}
              </Button>
            ) : (
              <>
                <Button
                  onClick={toggleFavorite}
                  className={`product-action-button product-action-button--secondary${
                    isFavorite ? " is-active" : ""
                  }`}
                  startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                >
                  {isFavorite ? "Fjern favorit" : "Tilføj til favoritter"}
                </Button>

                <Button
                  onClick={openOrCreateChat}
                  className="product-action-button product-action-button--secondary"
                  disabled={isCreatingChat}
                >
                  {isCreatingChat ? "Åbner chat..." : "Skriv til sælger"}
                </Button>

                <Box className="product-actions-row">
                  <Button
                    onClick={openOfferDrawer}
                    className="product-action-button product-action-button--secondary"
                    disabled={product.sold || product.price == null}
                  >
                    Giv bud
                  </Button>

                  <Button
                    variant="contained"
                    onClick={goToCheckout}
                    className="product-action-button"
                    disabled={product.sold || product.price == null}
                  >
                    {product.sold ? "Solgt" : "Køb nu"}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {product.price != null ? (
        <OfferBidDrawer
          open={isOfferDrawerOpen}
          onClose={() => setIsOfferDrawerOpen(false)}
          product={{
            id: product.id,
            title: product.title ?? "",
            price: product.price,
            image_url: product.image_url,
            user_id: product.user_id,
          }}
          viewerId={viewerId}
          onLoginRequired={handleGoogleLogin}
          onError={setError}
        />
      ) : null}
    </Box>
  );
}
