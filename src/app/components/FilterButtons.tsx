"use client"

import { getButtonStyles } from "@/app/utils/filterStyles"
import { Stack, Button } from "@mui/material"

interface FilterButtonsProps {
  activeFilter: "all" | "male" | "female"
  onFilterChange: (filter: "all" | "male" | "female") => void
}

export default function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  return (
    <Stack 
      direction="row" 
      spacing={2} 
      justifyContent="start" 
      sx={{ mb: 3, borderRadius: "3rem" }}
      >

      <Button 
        style={{ 
          borderRadius: "3rem", 
          padding: "0 1rem" 
        }} 
        sx={getButtonStyles(activeFilter, "all")} 
        onClick={() => onFilterChange("all")}
        >
          All
      </Button>

      <Button 
        style={{ 
          borderRadius: "3rem", 
          padding: "0 1rem" 
        }} 
        sx={getButtonStyles(activeFilter, "female")} 
        onClick={() => onFilterChange("female")}
        >
          Female
        </Button>

      <Button 
        style={{ 
          borderRadius: "3rem", 
          padding: "0 1rem" 
        }}
        sx={getButtonStyles(activeFilter, "male")} 
        onClick={() => onFilterChange("male")}
        >
          Male
        </Button>
    </Stack>
  )
}
