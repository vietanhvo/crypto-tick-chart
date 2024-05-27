"use client";

import React, { useEffect, useState } from "react";

import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

interface TokenSelectProps {
  symbols: string[];
  storageKey: string;
  onSelect: (symbol: string) => void;
}

const TokenSelect: React.FC<TokenSelectProps> = ({
  symbols,
  onSelect,
  storageKey,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  useEffect(() => {
    onSelect(selectedSymbol);
  }, [selectedSymbol, onSelect]);

  useEffect(() => {
    const savedSymbol = localStorage.getItem(storageKey);
    if (savedSymbol) {
      setSelectedSymbol(savedSymbol);
    }
  }, [storageKey, onSelect]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const symbol = event.target.value as string;
    setSelectedSymbol(symbol);
  };

  if (symbols.length === 0) return <CircularProgress />;

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="token-select-label">Token</InputLabel>
        <Select
          labelId="token-select-label"
          id="token-select"
          value={selectedSymbol}
          label="Token"
          onChange={handleChange}
        >
          {symbols.map((symbol) => (
            <MenuItem key={symbol} value={symbol}>
              {symbol}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TokenSelect;
