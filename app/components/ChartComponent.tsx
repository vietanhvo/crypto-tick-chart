"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import useBinanceFuturesSocket from "@/hooks/useBinanceFutureSocket";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";

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
    horzLine: {
      visible: true,
      labelVisible: true,
    },
  },
  timeScale: {
    barSpacing: 28,
    timeVisible: true,
  },
} as const;

const initialData: LineData<UTCTimestamp>[] = [];

const ChartComponent: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [_data, setData] = useState<LineData<UTCTimestamp>[]>(initialData);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const seriesInstanceRef = useRef<ISeriesApi<"Line"> | null>(null);

  const { timestamp, price } = useBinanceFuturesSocket(symbol);

  const resizeChart = useCallback(() => {
    if (chartInstanceRef.current && chartContainerRef.current) {
      const { width } = chartContainerRef.current.getBoundingClientRect();
      chartInstanceRef.current.applyOptions({ width });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      resizeChart();
    };

    if (chartContainerRef.current && !chartInstanceRef.current) {
      const chart = createChart(chartContainerRef.current, {
        ...options,
        width: chartContainerRef.current.clientWidth,
      });
      seriesInstanceRef.current = chart.addLineSeries();
      seriesInstanceRef.current.setData(initialData);
      chartInstanceRef.current = chart;
    }

    window.addEventListener("resize", handleResize);
    resizeChart();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [resizeChart]);

  useEffect(() => {
    if (seriesInstanceRef.current) {
      seriesInstanceRef.current.setData(initialData);
    }
  }, [symbol]);

  useEffect(() => {
    if (!symbol || !timestamp || price === null) return;

    if (seriesInstanceRef.current) {
      const newData: LineData<UTCTimestamp> = {
        time: timestamp,
        value: price,
      };

      setData((prevData) => [...prevData, newData]);

      if (seriesInstanceRef.current) {
        seriesInstanceRef.current.update(newData);
      }
    }
  }, [timestamp, price]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: "100%", height: "300px" }}
    ></div>
  );
};

export default ChartComponent;
