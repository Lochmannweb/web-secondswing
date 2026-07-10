export type NetsPaymentMethodId = "card" | "mobilepay";

export interface NetsPaymentMethod {
  id: NetsPaymentMethodId;
  label: string;
  description: string;
}

export const NETS_PAYMENT_METHODS: NetsPaymentMethod[] = [
  {
    id: "card",
    label: "Betalkort",
    description: "Dankort, Visa, Mastercard via Nets",
  },
  {
    id: "mobilepay",
    label: "MobilePay",
    description: "Betal med MobilePay via Nets",
  },
];
