import { createNetsPaymentSession } from "@/app/lib/netsCheckout";
import type { NetsPaymentMethodId } from "@/app/lib/paymentMethods";
import { NETS_PAYMENT_METHODS } from "@/app/lib/paymentMethods";
import type { ShippingAddress } from "@/app/lib/shippingAddress";
import { NextRequest, NextResponse } from "next/server";

const VALID_PAYMENT_METHODS = new Set(NETS_PAYMENT_METHODS.map((method) => method.id));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId = body.productId as string | undefined;
    const paymentMethod = body.paymentMethod as NetsPaymentMethodId | undefined;
    const deliveryMethod = body.deliveryMethod as "pickup" | "home" | undefined;
    const totalAmount = Number(body.totalAmount);
    const itemPrice = Number(body.itemPrice);
    const shippingFee = Number(body.shippingFee);
    const address = body.address as ShippingAddress | undefined;

    if (!productId || !paymentMethod || !deliveryMethod || !address) {
      return NextResponse.json(
        { status: "error", message: "Ufuldstændige betalingsoplysninger" },
        { status: 400 }
      );
    }

    if (!VALID_PAYMENT_METHODS.has(paymentMethod)) {
      return NextResponse.json(
        { status: "error", message: "Ugyldig betalingsmetode" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { status: "error", message: "Ugyldigt beløb" },
        { status: 400 }
      );
    }

    if (
      !address.fullName?.trim() ||
      !address.street?.trim() ||
      !address.postalCode?.trim() ||
      !address.city?.trim() ||
      !address.phone?.trim()
    ) {
      return NextResponse.json(
        { status: "error", message: "Udfyld leverings- og kontaktoplysninger" },
        { status: 400 }
      );
    }

    const origin = request.nextUrl.origin;
    const result = await createNetsPaymentSession(
      {
        productId,
        paymentMethod,
        deliveryMethod,
        totalAmount,
        itemPrice,
        shippingFee,
        address,
      },
      origin
    );

    if (result.status === "redirect" && result.redirectUrl) {
      return NextResponse.json(result);
    }

    if (result.status === "not_configured") {
      return NextResponse.json(result, { status: 503 });
    }

    return NextResponse.json(result, { status: 500 });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Kunne ikke starte betaling" },
      { status: 500 }
    );
  }
}
