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
            sx={{ mb: 3, mt: { xs: "5rem", s: "3rem" }, display: "flex", justifyContent: "center", border: "none" }}
        >   
            <TextField
                variant="outlined"
                placeholder="Søg efter produkter..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                    borderRadius: "0.5rem",
                    "& fieldset": {
                      borderColor: "gray", // default border
                    },
                    "&:hover fieldset": {
                      borderColor: "white", // hover border
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "white", // focused border (blue one you see)
                    },
                    },
                    input: { color: "white" },
                }}
                InputProps={{
                    sx: { 
                        color: "white",
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


