"use client";

import React from "react";

import { useChartContext } from "@/context";
import { FormControl, TextField } from "@mui/material";
import AutocompleteVirtual from "./AutocompleteVirtual";

interface TokenSelectProps {
  id: string;
}

const TokenSelect: React.FC<TokenSelectProps> = ({ id }) => {
  const { allSymbols, selectedSymbolMap, select } = useChartContext();

  const selectedSymbol = selectedSymbolMap.get(id);

  const symbolsList =
    allSymbols?.[selectedSymbol?.exchange]?.[selectedSymbol?.productType] ?? [];

  const handleChange = (newValue: string) => {
    const symbol = newValue;
    select({
      id,
      data: {
        data: symbolsList.find((data) => data.symbol === symbol),
      },
    });
  };

  return (
    <FormControl fullWidth size="small">
      <AutocompleteVirtual
        options={symbolsList.map((data) => data.symbol)}
        value={selectedSymbol?.data?.symbol || null}
        onChange={(_, newValue) => handleChange(newValue)}
        renderInput={(params) => (
          <TextField {...params} size="small" label="Token" />
        )}
      />
    </FormControl>
  );
};

export default TokenSelect;
