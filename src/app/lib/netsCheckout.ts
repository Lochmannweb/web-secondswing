import type { NetsPaymentMethodId } from "@/app/lib/paymentMethods";
import type { ShippingAddress } from "@/app/lib/shippingAddress";

export interface NetsCheckoutRequest {
  productId: string;
  paymentMethod: NetsPaymentMethodId;
  deliveryMethod: "pickup" | "home";
  totalAmount: number;
  itemPrice: number;
  commissionFee: number;
  shippingFee: number;
  address: ShippingAddress;
}

export interface NetsCheckoutResponse {
  status: "redirect" | "not_configured" | "error";
  redirectUrl?: string;
  message: string;
}

export function isNetsConfigured(): boolean {
  return Boolean(
    process.env.NETS_MERCHANT_ID &&
      process.env.NETS_TOKEN &&
      process.env.NETS_CHECKOUT_KEY
  );
}

/**
 * Initiates a Nets (Nexi) payment session.
 * Wire up the real Nets Hosted Payment Page / REST API here when credentials are available.
 */
export async function createNetsPaymentSession(
  payload: NetsCheckoutRequest,
  origin: string
): Promise<NetsCheckoutResponse> {
  if (!isNetsConfigured()) {
    return {
      status: "not_configured",
      message:
        "Betaling via Nets er ikke aktiveret endnu. Tilføj NETS_MERCHANT_ID, NETS_TOKEN og NETS_CHECKOUT_KEY.",
    };
  }

  const returnUrl = `${origin}/products/${payload.productId}/checkout/success`;
  const cancelUrl = `${origin}/products/${payload.productId}/checkout?cancelled=1`;

  // Placeholder until Nets SDK / REST integration is added.
  // The session should include order reference, amount (øre), payment method, and return URLs.
  void returnUrl;
  void cancelUrl;
  void payload;

  return {
    status: "not_configured",
    message: "Nets-betaling er under opsætning. Kontakt support hvis problemet fortsætter.",
  };
}
