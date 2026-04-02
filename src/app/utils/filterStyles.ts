import type { ProductCategory } from "@/app/lib/productForm";

export type Filter = "all" | ProductCategory;

export function getButtonStyles(active: Filter, current: Filter) {
  if (active === current) {
    return {
      backgroundColor: "#251d15",
      color: "white",
      border: "none",
      borderRadius: "3px",
      padding: "0px 1rem",
      fontSize: "0.7rem",
    };
  }

  return {
    backgroundColor: "transparent",
    color: "white",
    border: "1px solid #251d15",
    borderRadius: "3px",
    padding: "0px 1rem",
    fontSize: "0.7rem",
  };
}
