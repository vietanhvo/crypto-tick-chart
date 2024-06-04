"use client";

import React, { useState } from "react";

import { DataPointSettings } from "@/common";
import { useChartContext } from "@/context";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import { Input } from "@mui/material";
import Fade from "@mui/material/Fade";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import ChartComponent from "./ChartComponent";
import ExchangeSelect from "./ExchangeSelect";
import ProductSelect from "./ProductSelect";
import TokenSelect from "./TokenSelect";

interface IChartContainerProps {
  id: string;
}

const ChartContainer: React.FC<IChartContainerProps> = ({ id }) => {
  const { selectedSymbolMap, removeSelectSymbol, setDataPointSettings } =
    useChartContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleMaxDataPointsChange = (_event: Event, newValue: number) => {
    setDataPointSettings({ id, maxDataPoints: newValue });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value !== "") {
      let dataPoints = Number(event.target.value);
      if (dataPoints < DataPointSettings.MIN_DATA_POINTS) {
        dataPoints = DataPointSettings.MIN_DATA_POINTS;
      } else if (dataPoints > DataPointSettings.MAX_DATA_POINTS) {
        dataPoints = DataPointSettings.MAX_DATA_POINTS;
      }

      setDataPointSettings({
        id,
        maxDataPoints: dataPoints,
      });
    }
  };

  const handleBlur = () => {
    if (
      selectedSymbolMap.get(id).maxDataPoints <
      DataPointSettings.MIN_DATA_POINTS
    ) {
      setDataPointSettings({
        id,
        maxDataPoints: DataPointSettings.MIN_DATA_POINTS,
      });
    } else if (
      selectedSymbolMap.get(id).maxDataPoints >
      DataPointSettings.MAX_DATA_POINTS
    ) {
      setDataPointSettings({
        id,
        maxDataPoints: DataPointSettings.MAX_DATA_POINTS,
      });
    }
  };

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
          <ExchangeSelect id={id} />
        </Grid>
        <Grid item xs>
          <ProductSelect id={id} />
        </Grid>
        <Grid item xs>
          <TokenSelect id={id} />
        </Grid>
        <Grid item xs={false}>
          <IconButton onClick={handleSettingsClick}>
            <SettingsIcon />
          </IconButton>
        </Grid>
        <Grid item xs={false}>
          <IconButton onClick={() => removeSelectSymbol(id)}>
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
        TransitionComponent={Fade}
        elevation={4}
      >
        <Grid
          container
          spacing={4}
          alignItems="center"
          sx={{ px: 2, py: 3, width: 600 }}
        >
          <Grid item>
            <Typography>Data points:</Typography>
          </Grid>
          <Grid item xs>
            <Slider
              value={selectedSymbolMap.get(id).maxDataPoints}
              size="small"
              min={DataPointSettings.MIN_DATA_POINTS}
              max={DataPointSettings.MAX_DATA_POINTS}
              step={1}
              onChange={handleMaxDataPointsChange}
              valueLabelDisplay="auto"
              aria-labelledby="input-slider"
            />
          </Grid>
          <Grid item>
            <Input
              value={selectedSymbolMap.get(id).maxDataPoints}
              size="small"
              onChange={handleInputChange}
              onBlur={handleBlur}
              inputProps={{
                step: 20,
                min: DataPointSettings.MIN_DATA_POINTS,
                max: DataPointSettings.MAX_DATA_POINTS,
                type: "number",

                "aria-labelledby": "input-slider",
              }}
            />
          </Grid>
        </Grid>
      </Menu>

      <Grid item xs={12}>
        <ChartComponent id={id} />
      </Grid>
    </Grid>
  );
};

export default ChartContainer;
