"use client";

import React, { useEffect, useRef, useState } from "react";

import {
  ISeriesApi,
  LineData,
  Time,
  UTCTimestamp,
  WhitespaceData,
} from "lightweight-charts";
import { Chart, LineSeries, TimeScale } from "lightweight-charts-react-wrapper";

const options = {
  height: 300,
  layout: {
    textColor: "#d1d4dc",
    backgroundColor: "#000000",
  },
  rightPriceScale: {
    scaleMargins: {
      top: 0.3,
      bottom: 0.25,
    },
  },
  crosshair: {
    vertLine: {
      width: 4,
      color: "rgba(224, 227, 235, 0.1)",
      style: 0,
    },
    horzLine: {
      visible: false,
      labelVisible: false,
    },
  },
  grid: {
    vertLines: {
      color: "rgba(42, 46, 57, 0)",
    },
    horzLines: {
      color: "rgba(42, 46, 57, 0)",
    },
  },
  handleScroll: {
    vertTouchDrag: false,
  },
} as const;

const initialData: (WhitespaceData<Time> | LineData<Time>)[] = [];

const ChartComponent: React.FC = () => {
  const [stateData, setStateData] = useState(initialData);
  const series = useRef<ISeriesApi<"Line">>(null);
  const chartRef = useRef(null);

  return (
    <div ref={chartRef} style={{ width: "100%", maxWidth: "1000px" }}>
      <Chart {...options} width={chartRef.current?.clientWidth}>
        <LineSeries
          ref={series}
          data={stateData}
          color="rgb(0, 120, 255)"
          lineWidth={2}
          crosshairMarkerVisible={false}
          lastValueVisible={false}
          priceLineVisible={false}
        />
        <TimeScale rightOffset={12} secondsVisible={true} timeVisible={true} />
      </Chart>
    </div>
  );
};

export default ChartComponent;
