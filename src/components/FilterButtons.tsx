"use client"

import { Stack, Button } from "@mui/material"

interface FilterButtonsProps {
  activeFilter: "all" | "male" | "female"
  onFilterChange: (filter: "all" | "male" | "female") => void
}

export default function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  const buttonStyles = (filter: string) => ({
    backgroundColor: activeFilter === filter ? 
      filter === "male" ? "black" : 
      filter === "female" ? "black" : 
      "black" 
      : "transparent",
    color: activeFilter === filter ? "white" : "black",
    border: "1px solid #616161",
    "&:hover": {
      backgroundColor: 
                      filter === "male" ? "lightgray" : 
                      filter === "female" ? "lightgray" : "lightgray",
      // color: "white",
    },
  })

  return (
    <Stack 
      direction="row" 
      spacing={2} 
      justifyContent="start" 
      sx={{ mb: 3, borderRadius: "3rem" }}>
      <Button style={{ borderRadius: "3rem" }} sx={buttonStyles("all")} onClick={() => onFilterChange("all")}>All</Button>
      <Button style={{ borderRadius: "3rem" }} sx={buttonStyles("female")} onClick={() => onFilterChange("female")}>Female</Button>
      <Button style={{ borderRadius: "3rem" }} sx={buttonStyles("male")} onClick={() => onFilterChange("male")}>Male</Button>
      {/* <Button sx={buttonStyles("unisex")} onClick={() => onFilterChange("unisex")}>Unisex</Button> */}
    </Stack>
  )
}
