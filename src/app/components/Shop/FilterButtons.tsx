"use client"

import { CATEGORY_OPTIONS } from "@/app/lib/productForm"
import { getButtonStyles } from "@/app/utils/filterStyles"
import type { Filter } from "@/app/utils/filterStyles"
import { Stack, Button } from "@mui/material"

interface FilterButtonsProps {
  activeFilter: Filter
  onFilterChange: (filter: Filter) => void
}

export default function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      <Button
        sx={getButtonStyles(activeFilter, "all")}
        onClick={() => onFilterChange("all")}
      >
        Alle
      </Button>

      {CATEGORY_OPTIONS.map((category) => {
        const categoryFilter = category.value as Filter

        return (
          <Button
            key={category.value}
            sx={getButtonStyles(activeFilter, categoryFilter)}
            onClick={() => onFilterChange(categoryFilter)}
          >
            {category.label}
          </Button>
        )
      })}
    </Stack>
  )
}
