"use client";

import React from "react";

import { useChartContext } from "@/context";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

interface TokenSelectProps {
  index: number;
}

const TokenSelect: React.FC<TokenSelectProps> = ({ index }) => {
  const { allSymbols, selectedSymbols, setSelectedSymbols } = useChartContext();

  const { exchange, productType } = selectedSymbols[index];
  const symbolsList = allSymbols[exchange][productType];

  const handleChange = (event: SelectChangeEvent<string>) => {
    const symbol = event.target.value as string;
    setSelectedSymbols((prev) => {
      const updatedSymbols = [...prev];

      updatedSymbols[index].data = symbolsList.find(
        (data) => data.symbol === symbol,
      );
      return updatedSymbols;
    });
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="token-select-label">Token</InputLabel>
      <Select
        labelId="token-select-label"
        id="token-select"
        value={selectedSymbols[index].data.symbol}
        label="Token"
        onChange={handleChange}
      >
        {symbolsList?.map(({ symbol }) => (
          <MenuItem key={symbol} value={symbol}>
            {symbol}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TokenSelect;
