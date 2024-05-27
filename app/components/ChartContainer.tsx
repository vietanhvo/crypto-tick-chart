"use client";

import { Box, Grid } from "@mui/material";
import ChartComponent from "./ChartComponent";
import TokenSelect from "./TokenSelect";
import { useState } from "react";

interface IChartContainerProps {
  symbols: string[];
}

const ChartContainer: React.FC<IChartContainerProps> = ({ symbols }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  return (
    <Grid item xs={12} sm={12} md={6}>
      <Box
        sx={{
          marginBottom: 4,
          padding: 2,
          border: "1px solid gray",
          borderRadius: 1,
        }}
      >
        <TokenSelect
          symbols={symbols}
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
        />
        <ChartComponent />
      </Box>
    </Grid>
  );
};

export default ChartContainer;
