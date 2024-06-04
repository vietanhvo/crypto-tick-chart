"use client";

import React, { useCallback, useEffect, useState } from "react";

import {
  DataPointSettings,
  Exchange,
  KucoinBulletData,
  ProductType,
} from "@/common";
import { useChartContext } from "@/context";
import ChartDataProvider from "@/context/ChartDataProvider";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Button, Grid, ThemeProvider, createTheme } from "@mui/material";
import ChartContainer from "./ChartContainer";

const theme = createTheme({
  palette: {
    primary: {
      main: "#AF5F5F",
    },
  },
});

const ChartContainersWrapper: React.FC<{
  kucoinBulletData: {
    [ProductType.SPOT]: KucoinBulletData;
    [ProductType.FUTURE]: KucoinBulletData;
  };
}> = ({ kucoinBulletData }) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const { addSelectSymbol, selectedSymbols } = useChartContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddContainer = useCallback(() => {
    addSelectSymbol({
      exchange: "",
      productType: "",
      data: {
        symbol: "",
        pricePrecision: 0,
      },
      maxDataPoints: DataPointSettings.MAX_DATA_POINTS,
    });
  }, [addSelectSymbol]);

  const configs = selectedSymbols.map(({ exchange, productType, data }) => ({
    exchange: exchange as Exchange,
    productType: productType as ProductType,
    symbol: data?.symbol,
  }));

  return (
    mounted && (
      <ThemeProvider theme={theme}>
        <Button
          onClick={handleAddContainer}
          variant="contained"
          size="large"
          sx={{ position: "fixed", bottom: 18, right: 18, zIndex: 9999 }}
          startIcon={<AddCircleIcon />}
        >
          Add Chart
        </Button>
        <ChartDataProvider
          configs={configs}
          kucoinBulletData={kucoinBulletData}
        >
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 10 }}>
            {selectedSymbols.map((symbol) => (
              <Grid key={symbol.id} item md={12} lg={6}>
                <ChartContainer id={symbol.id} />
              </Grid>
            ))}
          </Grid>
        </ChartDataProvider>
      </ThemeProvider>
    )
  );
};

export default ChartContainersWrapper;
