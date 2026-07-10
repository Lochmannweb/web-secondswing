"use client";

import { getSupabaseClient } from "@/app/lib/supabaseClient";
import { Box, Button } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../checkout.css";

/**
 * Landing page after Nets payment redirect.
 * Order completion (mark sold, notify seller) runs here once Nets confirms payment.
 */
export default function CheckoutSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string | undefined;
  const supabase = getSupabaseClient();

  const [status, setStatus] = useState<"loading" | "pending" | "completed" | "error">("loading");
  const [message, setMessage] = useState("Bekræfter betaling...");

  useEffect(() => {
    if (!productId) {
      setStatus("error");
      setMessage("Manglende produkt-id");
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const viewerId = userData.user?.id;

        if (!viewerId) {
          setStatus("error");
          setMessage("Du skal være logget ind for at se ordrebekræftelse");
          return;
        }

        // TODO: Verify Nets transaction ID from query params against Nets API.
        // Until Nets is integrated, show pending state instead of completing the order.
        setStatus("pending");
        setMessage(
          "Betalingen afventer bekræftelse fra Nets. Dit køb gennemføres automatisk, når Nets-betalingen er verificeret."
        );
      } catch {
        setStatus("error");
        setMessage("Kunne ikke bekræfte betaling");
      }
    };

    verifyPayment();
  }, [productId, supabase]);

  return (
    <Box className="checkout-page">
      <h1 className="checkout-title">Ordrebekræftelse</h1>
      <section className="checkout-section">
        <p className="checkout-address-summary">{message}</p>
        {status === "pending" ? (
          <p className="checkout-payment-hint">
            Når Nets er sat op, markeres produktet som solgt og sælgeren underrettes automatisk
            efter bekræftet betaling.
          </p>
        ) : null}
      </section>

      <Button
        variant="contained"
        className="checkout-pay"
        onClick={() => router.push(productId ? `/products/${productId}` : "/shop")}
      >
        Tilbage til produkt
      </Button>
    </Box>
  );
}
