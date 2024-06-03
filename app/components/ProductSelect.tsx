"use client";

import React, { useCallback } from "react";

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
  id: string;
}

const ProductSelect: React.FC<ProductSelectProps> = ({ id }) => {
  const { exchangeProducts, selectedSymbolMap, select } = useChartContext();

  const productsList = exchangeProducts[selectedSymbolMap.get(id)?.exchange];

  const handleChange = useCallback((event: SelectChangeEvent<string>) => {
    const product = event.target.value as ProductType;
    select({
      id,
      data: {
        productType: product,
        data: {
          symbol: "",
          pricePrecision: 0,
        },
      },
    });
  }, []);

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="token-select-label">Product</InputLabel>
      <Select
        labelId="token-select-label"
        id="token-select"
        value={selectedSymbolMap.get(id)?.productType ?? ""}
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
