export type Filter = "all" | "male" | "female";

export function getButtonStyles(active: Filter, current: Filter) {
  if (active === current) {
    return {
      backgroundColor: "#3d5d31ff",
      color: "white",
      border: "1px solid #3d5d31ff",
    };
  }

  return {
    backgroundColor: "transparent",
    color: "white",
    border: "1px solid #3d5d31ff",
  };
}
