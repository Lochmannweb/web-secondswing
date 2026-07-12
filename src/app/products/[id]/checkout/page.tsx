"use client";

import {
  EMPTY_SHIPPING_ADDRESS,
  formatShippingAddress,
  shippingAddressFromMetadata,
  shippingAddressToMetadata,
  type ShippingAddress,
} from "@/app/lib/shippingAddress";
import {
  NETS_PAYMENT_METHODS,
  type NetsPaymentMethodId,
} from "@/app/lib/paymentMethods";
import { getProductById } from "@/app/lib/crud";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Alert, Box, Button, TextField } from "@mui/material";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import "./checkout.css";

type DeliveryMethod = "pickup" | "home";

interface Product {
  id: string;
  title: string;
  price: number | null;
  image_url: string | null;
  user_id: string;
  sold: boolean | null;
}

interface NetsCheckoutApiResponse {
  status: "redirect" | "not_configured" | "error";
  redirectUrl?: string;
  message: string;
}

const SHIPPING_FEE_HOME = 49;
const BUYER_PROTECTION_FEE = 0;

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = params.id as string | undefined;
  const supabase = getSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_SHIPPING_ADDRESS);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("home");
  const [paymentMethod, setPaymentMethod] = useState<NetsPaymentMethodId | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (searchParams.get("cancelled") === "1") {
      setInfoMessage("Betalingen blev annulleret. Vælg betalingsmetode og prøv igen.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!productId) {
      setError("Intet produkt id");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id ?? null;
        setViewerId(currentUserId);

        if (!currentUserId) {
          const { error: authError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/products/${productId}/checkout`,
              queryParams: { prompt: "select_account" },
            },
          });

          if (authError) {
            throw new Error(authError.message);
          }
          return;
        }

        const data = await getProductById(productId);

        if (data.user_id === currentUserId) {
          throw new Error("Du kan ikke købe dit eget produkt");
        }

        if (data.sold) {
          throw new Error("Produktet er allerede solgt");
        }

        if (data.price == null) {
          throw new Error("Produktet har ingen pris");
        }

        setProduct({
          id: data.id,
          title: data.title ?? "",
          price: data.price,
          image_url: data.image_url,
          user_id: data.user_id,
          sold: data.sold,
        });
        setAddress(
          shippingAddressFromMetadata(userData.user?.user_metadata, userData.user?.email ?? "")
        );

        const hasAddress =
          Boolean(userData.user?.user_metadata?.shipping_street) ||
          Boolean(userData.user?.user_metadata?.shipping_city);
        setIsEditingAddress(!hasAddress);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kunne ikke hente checkout";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [productId, supabase]);

  const shippingFee = deliveryMethod === "home" ? SHIPPING_FEE_HOME : 0;
  const itemPrice = product?.price ?? 0;
  const totalPrice = useMemo(
    () => itemPrice + shippingFee + BUYER_PROTECTION_FEE,
    [itemPrice, shippingFee]
  );

  const updateAddressField = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const saveAddressToProfile = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("Du skal være logget ind");
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...userData.user.user_metadata,
        ...shippingAddressToMetadata(address),
        display_name: address.fullName.trim() || userData.user.user_metadata?.display_name,
      },
    });

    if (updateError) {
      throw new Error(updateError.message);
    }
  };

  const handlePay = async () => {
    if (!product || !viewerId) return;

    if (!paymentMethod) {
      setError("Vælg en betalingsmetode før du betaler");
      return;
    }

    if (!address.fullName.trim() || !address.street.trim() || !address.postalCode.trim() || !address.city.trim()) {
      setError("Udfyld leveringsadresse før betaling");
      setIsEditingAddress(true);
      return;
    }

    if (!address.phone.trim()) {
      setError("Tilføj telefonnummer under kontaktoplysninger");
      setIsEditingAddress(true);
      return;
    }

    setIsPaying(true);
    setError(null);
    setInfoMessage(null);

    try {
      await saveAddressToProfile();

      const response = await fetch("/api/checkout/nets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          paymentMethod,
          deliveryMethod,
          totalAmount: totalPrice,
          itemPrice,
          shippingFee,
          address,
        }),
      });

      const result = (await response.json()) as NetsCheckoutApiResponse;

      if (result.status === "redirect" && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      if (result.status === "not_configured") {
        setError(
          "Betaling via Nets er ikke aktiveret endnu. Dit køb er ikke gennemført — vælg betalingsmetode og prøv igen, når Nets er sat op."
        );
        return;
      }

      throw new Error(result.message || "Kunne ikke starte betaling");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Betaling kunne ikke startes";
      setError(msg);
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return <p className="checkout-page-status">Forbereder udtjekning...</p>;
  }

  if (error && !product) {
    return <p className="checkout-page-status">{error}</p>;
  }

  if (!product) {
    return <p className="checkout-page-status">Produkt ikke fundet.</p>;
  }

  return (
    <Box className="checkout-page">
      <Button
        onClick={() => router.push(`/products/${product.id}`)}
        className="checkout-back"
        startIcon={<NavigateBeforeIcon />}
      >
        Tilbage
      </Button>

      <h1 className="checkout-title">Udtjekning</h1>

      <Box className="checkout-sections">
        <section className="checkout-section">
          <Box className="checkout-section-header">
            <div>
              <p className="checkout-section-kicker">Produkt</p>
              <h2 className="checkout-section-title">Dit køb</h2>
            </div>
          </Box>
          <Box className="checkout-product">
            <Box className="checkout-product-image">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : null}
            </Box>
            <div>
              <p className="checkout-product-name">{product.title}</p>
              <p className="checkout-product-meta">Second Swing annonce</p>
            </div>
            <p className="checkout-product-price">{itemPrice} kr</p>
          </Box>
        </section>

        <section className="checkout-section">
          <Box className="checkout-section-header">
            <div>
              <p className="checkout-section-kicker">Leveringsadresse</p>
              <h2 className="checkout-section-title">Hvor skal pakken sendes hen?</h2>
            </div>
            <Button
              onClick={() => setIsEditingAddress((prev) => !prev)}
              className="checkout-edit"
            >
              {isEditingAddress ? "Gem visning" : "Rediger"}
            </Button>
          </Box>

          {isEditingAddress ? (
            <Box className="checkout-fields">
              <TextField
                className="checkout-field"
                label="Fulde navn"
                value={address.fullName}
                onChange={(e) => updateAddressField("fullName", e.target.value)}
                fullWidth
                margin="dense"
              />
              <TextField
                className="checkout-field"
                label="Gade og husnummer"
                value={address.street}
                onChange={(e) => updateAddressField("street", e.target.value)}
                fullWidth
                margin="dense"
              />
              <TextField
                className="checkout-field"
                label="Postnummer"
                value={address.postalCode}
                onChange={(e) => updateAddressField("postalCode", e.target.value)}
                fullWidth
                margin="dense"
              />
              <TextField
                className="checkout-field"
                label="By"
                value={address.city}
                onChange={(e) => updateAddressField("city", e.target.value)}
                fullWidth
                margin="dense"
              />
              <TextField
                className="checkout-field"
                label="Land"
                value={address.country}
                onChange={(e) => updateAddressField("country", e.target.value)}
                fullWidth
                margin="dense"
              />
            </Box>
          ) : (
            <p className="checkout-address-summary">
              {formatShippingAddress(address) || "Ingen adresse angivet endnu."}
            </p>
          )}
        </section>

        <section className="checkout-section">
          <Box className="checkout-section-header">
            <div>
              <p className="checkout-section-kicker">Leveringsmuligheder</p>
              <h2 className="checkout-section-title">Vælg levering</h2>
            </div>
          </Box>
          <Box className="checkout-delivery-options">
            <Button
              onClick={() => setDeliveryMethod("pickup")}
              className={`checkout-delivery-option${deliveryMethod === "pickup" ? " is-selected" : ""}`}
            >
              <span className="checkout-delivery-option-label">Afhentning</span>
              <span className="checkout-delivery-option-meta">
                Afhent hos sælger — gratis
              </span>
            </Button>
            <Button
              onClick={() => setDeliveryMethod("home")}
              className={`checkout-delivery-option${deliveryMethod === "home" ? " is-selected" : ""}`}
            >
              <span className="checkout-delivery-option-label">Send til hjem</span>
              <span className="checkout-delivery-option-meta">
                Levering til din adresse — {SHIPPING_FEE_HOME} kr
              </span>
            </Button>
          </Box>
        </section>

        <section className="checkout-section">
          <Box className="checkout-section-header">
            <div>
              <p className="checkout-section-kicker">Leveringsoplysninger</p>
              <h2 className="checkout-section-title">Detaljer</h2>
            </div>
          </Box>
          <p className="checkout-address-summary">
            {deliveryMethod === "home"
              ? `Pakken sendes til ${address.street || "din adresse"}, ${address.postalCode} ${address.city}.`
              : "Du og sælgeren aftaler afhentning direkte i chatten efter købet."}
          </p>
        </section>

        <section className="checkout-section">
          <Box className="checkout-section-header">
            <div>
              <p className="checkout-section-kicker">Kontaktoplysninger</p>
              <h2 className="checkout-section-title">Dine oplysninger</h2>
            </div>
          </Box>
          <Box className="checkout-fields">
            <TextField
              className="checkout-field"
              label="Telefon"
              value={address.phone}
              onChange={(e) => updateAddressField("phone", e.target.value)}
              fullWidth
              margin="dense"
            />
            <TextField
              className="checkout-field"
              label="E-mail"
              value={address.email}
              onChange={(e) => updateAddressField("email", e.target.value)}
              fullWidth
              margin="dense"
              disabled
            />
          </Box>
        </section>

        <section className="checkout-section">
          <Box className="checkout-section-header">
            <div>
              <p className="checkout-section-kicker">Betalingsmetode</p>
              <h2 className="checkout-section-title">Vælg hvordan du betaler</h2>
            </div>
          </Box>
          <Box className="checkout-payment-options">
            {NETS_PAYMENT_METHODS.map((method) => (
              <Button
                key={method.id}
                onClick={() => {
                  setPaymentMethod(method.id);
                  setError(null);
                }}
                className={`checkout-payment-option${
                  paymentMethod === method.id ? " is-selected" : ""
                }`}
              >
                <span className="checkout-payment-option-label">{method.label}</span>
                <span className="checkout-payment-option-meta">{method.description}</span>
              </Button>
            ))}
          </Box>
          <p className="checkout-payment-hint">
            Du sendes videre til Nets for at gennemføre betalingen. Købet gennemføres først,
            når betalingen er bekræftet af Nets.
          </p>
        </section>

        <section className="checkout-section">
          <Box className="checkout-section-header">
            <div>
              <p className="checkout-section-kicker">Prisoversigt</p>
              <h2 className="checkout-section-title">Betaling</h2>
            </div>
          </Box>
          <Box className="checkout-price-rows">
            <div className="checkout-price-row">
              <span>Produkt</span>
              <span>{itemPrice} kr</span>
            </div>
            <div className="checkout-price-row">
              <span>Levering</span>
              <span>{shippingFee === 0 ? "Gratis" : `${shippingFee} kr`}</span>
            </div>
            {BUYER_PROTECTION_FEE > 0 ? (
              <div className="checkout-price-row">
                <span>Køberbeskyttelse</span>
                <span>{BUYER_PROTECTION_FEE} kr</span>
              </div>
            ) : null}
            <div className="checkout-price-row checkout-price-row--total">
              <span>I alt</span>
              <span>{totalPrice} kr</span>
            </div>
          </Box>
        </section>
      </Box>

      <Button
        variant="contained"
        onClick={handlePay}
        className="checkout-pay"
        disabled={isPaying || !paymentMethod || Boolean(product.sold)}
      >
        {isPaying
          ? "Starter betaling..."
          : paymentMethod
            ? `Betal ${totalPrice} kr med Nets`
            : "Vælg betalingsmetode"}
      </Button>

      {infoMessage ? (
        <Alert severity="info" className="checkout-alert">
          {infoMessage}
        </Alert>
      ) : null}

      {error ? (
        <Alert severity="error" className="checkout-alert">
          {error}
        </Alert>
      ) : null}
    </Box>
  );
}
