"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Exchange, ProductType } from "@/common";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Button, Grid, ThemeProvider, createTheme } from "@mui/material";
import ChartContainer from "./ChartContainer";
import { useChartContext } from "@/context";

const theme = createTheme({
  palette: {
    primary: {
      main: "#AF5F5F",
    },
  },
});

const ChartContainersWrapper: React.FC = () => {
  const [mounted, setMounted] = useState<boolean>(false);

  const { addSelectSymbol, selectedSymbols, allSymbols } = useChartContext();

  useEffect(() => {
    // const savedContainers = localStorage.getItem("chartContainers");
    //
    // if (savedContainers) {
    //   setContainers(JSON.parse(savedContainers));
    // }

    setMounted(true);
  }, []);

  // useEffect(() => {
  //   if (mounted) {
  //     localStorage.setItem("chartContainers", JSON.stringify(containers));
  //   }
  // }, [containers]);

  const handleAddContainer = useCallback(() => {
    addSelectSymbol({
      exchange: Exchange.BINANCE,
      productType: ProductType.FUTURE,
      data: allSymbols[Exchange.BINANCE][ProductType.FUTURE][0],
    });
  }, [addSelectSymbol]);

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
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 10 }}>
          {selectedSymbols.map((_, index) => (
            <Grid key={index} item md={12} lg={6}>
              <ChartContainer index={index} />
            </Grid>
          ))}
        </Grid>
      </ThemeProvider>
    )
  );
};

export default ChartContainersWrapper;
