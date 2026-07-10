export const CUSTOM_OFFER_ID = "offer-custom";

export interface OfferPreset {
  id: string;
  amount: number;
  discountPercent: number;
  label: string;
}

function roundOfferAmount(amount: number): number {
  if (amount >= 1000) {
    return Math.round(amount / 50) * 50;
  }
  if (amount >= 100) {
    return Math.round(amount / 10) * 10;
  }
  return Math.max(1, Math.round(amount));
}

export function getOfferPresets(listPrice: number): OfferPreset[] {
  const discounts = [5, 10, 15];

  return discounts.map((discountPercent) => {
    const rawAmount = listPrice * (1 - discountPercent / 100);
    const amount = roundOfferAmount(rawAmount);

    return {
      id: `offer-${discountPercent}`,
      amount,
      discountPercent,
      label: `${amount} kr`,
    };
  });
}

export function parseCustomOfferAmount(value: string): number | null {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount);
}

export function validateCustomOfferAmount(amount: number, listPrice: number): string | null {
  if (amount >= listPrice) {
    return "Dit bud skal være lavere end annonceret pris";
  }

  if (amount < 1) {
    return "Indtast et gyldigt beløb";
  }

  return null;
}
