"use client";

import React from "react";

import { ProductType } from "@/common";
import { useChartContext } from "@/context";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

interface ProductSelectProps {
  index: number;
}

const ProductSelect: React.FC<ProductSelectProps> = ({ index }) => {
  const { exchangeProducts, selectedSymbols, setSelectedSymbols } =
    useChartContext();

  const { exchange, productType } = selectedSymbols[index];
  const productsList = exchangeProducts[exchange];

  const handleChange = (event: SelectChangeEvent<string>) => {
    const product = event.target.value as ProductType;
    setSelectedSymbols((prev) => {
      const updatedSymbols = [...prev];

      updatedSymbols[index].productType = product;
      updatedSymbols[index].data = {
        symbol: "",
        pricePrecision: 0,
      };

      return updatedSymbols;
    });
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="token-select-label">Product</InputLabel>
      <Select
        labelId="token-select-label"
        id="token-select"
        value={productType}
        label="Product"
        onChange={handleChange}
      >
        {productsList?.map((product) => (
          <MenuItem key={product} value={product}>
            {product}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ProductSelect;
