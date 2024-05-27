"use client";

import React, { useEffect, useState } from "react";

import { Box, Button, Grid } from "@mui/material";
import ChartContainer from "./ChartContainer";

interface IChartContainersWrapperProps {
  symbols: string[];
}

interface ChartContainerItem {
  id: number;
  symbols: string[];
}

const ChartContainersWrapper: React.FC<IChartContainersWrapperProps> = ({
  symbols,
}) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [containers, setContainers] = useState<ChartContainerItem[]>([
    { id: 1, symbols },
  ]);

  useEffect(() => {
    const savedContainers = localStorage.getItem("chartContainers");

    if (savedContainers) {
      setContainers(
        Array.from({ length: parseInt(savedContainers) }, (_, index) => ({
          id: ++index,
          symbols,
        })),
      );
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("chartContainers", `${containers.length}`);
    }
  }, [containers]);

  const handleAddContainer = () => {
    setContainers([...containers, { id: containers.length, symbols }]);
  };

  const handleRemoveContainer = (id: number) => {
    setContainers(containers.filter((container) => container.id !== id));
  };

  return (
    mounted && (
      <Box sx={{ padding: 2 }}>
        <Button
          variant="contained"
          onClick={handleAddContainer}
          sx={{ marginY: 2 }}
        >
          Add Chart
        </Button>
        <Grid container spacing={2} justifyContent="center">
          {containers.map(({ id, symbols }) => (
            <ChartContainer
              key={id}
              id={id}
              initialSymbols={symbols}
              onRemove={handleRemoveContainer}
            />
          ))}
        </Grid>
      </Box>
    )
  );
};

export default ChartContainersWrapper;
