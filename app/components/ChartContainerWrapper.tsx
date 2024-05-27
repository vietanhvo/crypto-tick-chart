"use client";

import { Box, Button, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import ChartContainer from "./ChartContainer";

interface IChartContainersWrapperProps {
  symbols: string[];
}

const ChartContainersWrapper: React.FC<IChartContainersWrapperProps> = ({
  symbols,
}) => {
  const [containers, setContainers] = useState<React.ReactNode[]>([
    <ChartContainer key={0} symbols={symbols} />,
  ]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddContainer = () => {
    setContainers([
      ...containers,
      <ChartContainer key={containers.length} symbols={symbols} />,
    ]);
  };

  return (
    mounted && (
      <Box sx={{ padding: 2 }}>
        <Button variant="contained" onClick={handleAddContainer} sx={{ my: 2 }}>
          Add Chart
        </Button>
        <Grid container spacing={2} justifyContent="center">
          {containers}
        </Grid>
      </Box>
    )
  );
};

export default ChartContainersWrapper;
