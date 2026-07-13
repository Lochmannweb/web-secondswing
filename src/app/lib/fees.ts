export const COMMISSION_RATE = 0.1;
export const SHIPPING_FEE_HOME = 49;
export const BUYER_PROTECTION_FEE = 0;

export function calculateCommissionFee(itemPrice: number): number {
  return Math.round(itemPrice * COMMISSION_RATE);
}
