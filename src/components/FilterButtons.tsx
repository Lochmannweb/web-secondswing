"use client"

import { Stack, Button } from "@mui/material"

interface FilterButtonsProps {
  activeFilter: "all" | "male" | "female"
  onFilterChange: (filter: "all" | "male" | "female") => void
}

export default function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  const buttonStyles = (filter: string) => ({
    backgroundColor: activeFilter === filter ? 
      filter === "male" ? "#60954d" : 
      filter === "female" ? "#60954d" : 
      "#60954d" 
      : "transparent",
    color: activeFilter === filter ? "white" : "black",
    // border: "1px solid #616161",
    "&:hover": {
      backgroundColor: 
                      filter === "male" ? "#e2ffd7" : 
                      filter === "female" ? "#e2ffd7" : "#e2ffd7",
      color: "black",
    },
  })

  return (
    <Stack 
      direction="row" 
      spacing={2} 
      justifyContent="start" 
      sx={{ mb: 3, borderRadius: "3rem" }}>
      <Button style={{ borderRadius: "3rem", padding: "0 1rem" }} sx={buttonStyles("all")} onClick={() => onFilterChange("all")}>All</Button>
      <Button style={{ borderRadius: "3rem", padding: "0 1rem" }} sx={buttonStyles("female")} onClick={() => onFilterChange("female")}>Female</Button>
      <Button style={{ borderRadius: "3rem", padding: "0 1rem" }} sx={buttonStyles("male")} onClick={() => onFilterChange("male")}>Male</Button>
      {/* <Button sx={buttonStyles("unisex")} onClick={() => onFilterChange("unisex")}>Unisex</Button> */}
    </Stack>
  )
}
