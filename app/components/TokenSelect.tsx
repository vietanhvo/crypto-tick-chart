"use client";

import React from "react";

import { useChartContext } from "@/context";
import { FormControl, TextField } from "@mui/material";
import AutocompleteVirtual from "./AutocompleteVirtual";

interface TokenSelectProps {
  index: number;
}

const TokenSelect: React.FC<TokenSelectProps> = ({ index }) => {
  const { allSymbols, selectedSymbols, setSelectedSymbols } = useChartContext();
  const { exchange, productType } = selectedSymbols[index];

  const symbolsList = allSymbols?.[exchange]?.[productType] ?? [];

  const handleChange = (newValue: string) => {
    const symbol = newValue;
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
      <AutocompleteVirtual
        options={symbolsList.map((data) => data.symbol)}
        value={selectedSymbols?.[index]?.data?.symbol || null}
        onChange={(_, newValue) => handleChange(newValue)}
        renderInput={(params) => (
          <TextField {...params} size="small" label="Token" />
        )}
      />
    </FormControl>
  );
};

export default TokenSelect;
