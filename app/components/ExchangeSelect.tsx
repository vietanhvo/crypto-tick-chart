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
  id: string;
}

const ExchangeSelect: React.FC<ExchangeSelectProps> = ({ id }) => {
  const { exchanges, selectedSymbolMap, select } = useChartContext();

  const handleChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const exchange = event.target.value as Exchange;

      select({
        id,
        data: {
          exchange,
          productType: "",
          data: {
            symbol: "",
            pricePrecision: 0,
          },
        },
      });
    },
    [select],
  );

  if (exchanges.length === 0) return <CircularProgress />;

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="token-select-label">Exchange</InputLabel>
      <Select
        labelId="token-select-label"
        id="token-select"
        value={selectedSymbolMap.get(id)?.exchange ?? ""}
        defaultValue=""
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
