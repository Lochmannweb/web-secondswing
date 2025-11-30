"use client"

import { Stack, Button } from "@mui/material"

interface FilterButtonsProps {
  activeFilter: "all" | "male" | "female"
  onFilterChange: (filter: "all" | "male" | "female") => void
}

export default function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  const buttonStyles = (filter: string) => ({
    backgroundColor: activeFilter === filter ? 
      filter === "male" ? "#3d5d31ff" : 
      filter === "female" ? "#3d5d31ff" : 
      "#3d5d31ff" 
      : "transparent",
    color: activeFilter === filter ? "white" : "white",
    border: "1px solid #3d5d31ff",
    "&:hover": {
      backgroundColor: 
                      filter === "male" ? "#8ad36fff" : 
                      filter === "female" ? "#8ad36fff" : "#8ad36fff",
      color: "white",
      fontWeight: "normal"
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
    </Stack>
  )
}
