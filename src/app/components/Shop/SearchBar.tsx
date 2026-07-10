"use client";

import { TextField, InputAdornment, IconButton, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Søg produkter...",
  className = "",
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(value.trim());
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className={`SearchBar-form ${className}`.trim()}
    >
      <TextField
        variant="outlined"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="SearchBar-field"
        InputProps={{
          className: "SearchBar-input",
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="submit"
                edge="end"
                className="SearchBar-button"
                aria-label="Søg"
              >
                <SearchIcon className="SearchBar-icon" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
