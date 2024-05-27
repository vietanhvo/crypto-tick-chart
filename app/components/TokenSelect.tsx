"use client";

import React, { useEffect } from "react";
import {
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  CircularProgress,
  SelectChangeEvent,
  Box,
} from "@mui/material";

interface ITokenSelectProps {
  symbols: string[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
}

const TokenSelect: React.FC<ITokenSelectProps> = ({
  symbols,
  selectedSymbol,
  setSelectedSymbol,
}) => {
  useEffect(() => {
    if (selectedSymbol && !symbols.includes(selectedSymbol)) {
      setSelectedSymbol("");
    }
  }, []);

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
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
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
