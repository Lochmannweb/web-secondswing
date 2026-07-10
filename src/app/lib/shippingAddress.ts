export interface ShippingAddress {
  fullName: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
}

export const EMPTY_SHIPPING_ADDRESS: ShippingAddress = {
  fullName: "",
  street: "",
  postalCode: "",
  city: "",
  country: "Danmark",
  phone: "",
  email: "",
};

type UserMetadata = Record<string, unknown> | undefined;

export function shippingAddressFromMetadata(
  metadata: UserMetadata,
  email = ""
): ShippingAddress {
  return {
    fullName:
      (metadata?.shipping_full_name as string) ||
      (metadata?.display_name as string) ||
      "",
    street: (metadata?.shipping_street as string) || "",
    postalCode: (metadata?.shipping_postal_code as string) || "",
    city:
      (metadata?.shipping_city as string) ||
      (metadata?.location as string) ||
      "",
    country: (metadata?.shipping_country as string) || "Danmark",
    phone: (metadata?.phone as string) || "",
    email,
  };
}

export function shippingAddressToMetadata(
  address: ShippingAddress
): Record<string, string> {
  return {
    shipping_full_name: address.fullName.trim(),
    shipping_street: address.street.trim(),
    shipping_postal_code: address.postalCode.trim(),
    shipping_city: address.city.trim(),
    shipping_country: address.country.trim(),
    phone: address.phone.trim(),
  };
}

export function formatShippingAddress(address: ShippingAddress): string {
  const parts = [
    address.fullName,
    address.street,
    `${address.postalCode} ${address.city}`.trim(),
    address.country,
  ].filter(Boolean);

  return parts.join(", ");
}
