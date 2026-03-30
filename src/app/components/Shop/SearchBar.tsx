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
            className="SearchBar-form"
        >   
            <TextField
                variant="outlined"
                placeholder="Søg efter produkter..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="SearchBar-field"
                InputProps={{
                    className: "SearchBar-input",
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton type="submit" edge="end" className="SearchBar-button">
                                <SearchIcon className="SearchBar-icon" />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    )
}


