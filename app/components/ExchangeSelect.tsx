"use client";

import React, { useCallback } from "react";

import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useChartContext } from "@/context";
import { Exchange } from "@/common";

interface ExchangeSelectProps {
  index: number;
}

const ExchangeSelect: React.FC<ExchangeSelectProps> = ({ index }) => {
  const { exchanges, selectedSymbols, setSelectedSymbols } = useChartContext();

  const handleChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const exchange = event.target.value as Exchange;

      setSelectedSymbols((prev) => {
        const updatedSymbols = [...prev];
        updatedSymbols[index].exchange = exchange;

        updatedSymbols[index].productType = "";
        updatedSymbols[index].data = {
          symbol: "",
          pricePrecision: 0,
        };

        return updatedSymbols;
      });
    },
    [setSelectedSymbols],
  );

  if (exchanges.length === 0) return <CircularProgress />;

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="token-select-label">Exchange</InputLabel>
      <Select
        labelId="token-select-label"
        id="token-select"
        value={selectedSymbols[index].exchange}
        label="Exchange"
        onChange={handleChange}
      >
        {exchanges?.map((symbol) => (
          <MenuItem key={symbol} value={symbol}>
            {symbol}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ExchangeSelect;
