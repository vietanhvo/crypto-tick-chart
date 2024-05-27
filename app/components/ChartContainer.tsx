"use client";

import React, { useEffect, useState } from "react";

import { Box, Button, Grid } from "@mui/material";
import ChartComponent from "./ChartComponent";
import TokenSelect from "./TokenSelect";

interface IChartContainerProps {
  id: number;
  initialSymbols: string[];
  onRemove: (id: number) => void;
}

const ChartContainer: React.FC<IChartContainerProps> = ({
  id,
  initialSymbols,
  onRemove,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    const savedSymbol = localStorage.getItem(`selectedSymbol-${id}`);
    if (savedSymbol) {
      setSelectedSymbol(savedSymbol);
    }
  }, [id]);

  useEffect(() => {
    if (selectedSymbol) {
      localStorage.setItem(`selectedSymbol-${id}`, selectedSymbol);
    }
  }, [selectedSymbol, id]);

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
          symbols={initialSymbols}
          onSelect={setSelectedSymbol}
          storageKey={`selectedSymbol-${id}`}
        />
        <Box sx={{ width: "100%" }}>
          <ChartComponent symbol={selectedSymbol} />
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onRemove(id)}
          sx={{ mt: 2 }}
        >
          Delete
        </Button>
      </Box>
    </Grid>
  );
};

export default ChartContainer;
