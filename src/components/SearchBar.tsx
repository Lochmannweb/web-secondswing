"use client"

import { useState } from "react"
import { TextField, InputAdornment, IconButton, Box } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"

interface SearchBarProps {
    onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(query.trim())
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mb: 3, display: "flex", justifyContent: "center", border: "none" }}
        >   
            <TextField
                variant="outlined"
                placeholder="Søg efter produkter..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                    borderRadius: "3rem",
                    "& fieldset": {
                      borderColor: "black", // default border
                    },
                    "&:hover fieldset": {
                      borderColor: "black", // hover border
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "black", // focused border (blue one you see)
                    },
                    },
                    input: { color: "black" },
                }}
                InputProps={{
                    sx: { 
                        color: "black",
                        "&:hover": {
                            border: "none"
                        }
                    },
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton type="submit" edge="end">
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    )
}


