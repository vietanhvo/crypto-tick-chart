"use client";

import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Grid, IconButton } from "@mui/material";
import ChartComponent from "./ChartComponent";
import TokenSelect from "./TokenSelect";
import { useChartContext } from "@/context";
import ExchangeSelect from "./ExchangeSelect";
import ProductSelect from "./ProductSelect";

interface IChartContainerProps {
  index: number;
}

const ChartContainer: React.FC<IChartContainerProps> = ({ index }) => {
  const { removeSelectSymbol } = useChartContext();

  return (
    <Grid
      container
      sx={{
        p: 2,
        pb: 0,
        border: "1px solid gray",
        borderRadius: 1,
      }}
      rowGap={1}
    >
      <Grid item xs={12} spacing={2} container>
        <Grid item xs>
          <ExchangeSelect index={index} />
        </Grid>
        <Grid item xs>
          <ProductSelect index={index} />
        </Grid>
        <Grid item xs>
          <TokenSelect index={index} />
        </Grid>
        <Grid item xs={false}>
          <IconButton onClick={() => removeSelectSymbol(index)}>
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <ChartComponent index={index} />
      </Grid>
    </Grid>
  );
};

export default ChartContainer;
