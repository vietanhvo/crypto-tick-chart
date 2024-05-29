"use client";

import React, { useCallback, useEffect, useRef } from "react";

import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";
import { Exchange, ProductType } from "@/common";
import { useChartContext } from "@/context";
import useChartSocket from "@/hooks/useChartSocket";

const options = {
  height: 300,
  layout: {
    textColor: "#d1d4dc",
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

const ChartComponent: React.FC<{ index: number }> = ({ index }) => {
  const { selectedSymbols } = useChartContext();
  const { exchange, productType, data } = selectedSymbols[index];
  const { price, timestamp } = useChartSocket(
    exchange as Exchange,
    productType as ProductType,
    data.symbol,
  );

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const seriesInstanceRef = useRef<ISeriesApi<"Line"> | null>(null);

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

    window.addEventListener("resize", handleResize);
    resizeChart();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [resizeChart]);

  useEffect(() => {
    if (
      chartContainerRef.current &&
      !chartInstanceRef.current &&
      data.pricePrecision
    ) {
      const chart = createChart(chartContainerRef.current, {
        ...options,
        width: chartContainerRef.current.clientWidth,
      });
      seriesInstanceRef.current = chart.addLineSeries({
        lineWidth: 1,
        color: "#AF5F5F",
        priceFormat: {
          type: "price",
          precision: data.pricePrecision,
          minMove: 1 / Math.pow(10, data.pricePrecision),
        },
      });
      seriesInstanceRef.current.setData(initialData);
      chartInstanceRef.current = chart;
    }
  }, []);

  useEffect(() => {
    if (seriesInstanceRef.current) {
      seriesInstanceRef.current.setData(initialData);
    }
  }, [exchange, productType, data]);

  useEffect(() => {
    if (!data?.symbol || !timestamp || price === null) return;

    if (seriesInstanceRef.current) {
      const newData: LineData<UTCTimestamp> = {
        time: timestamp,
        value: price,
      };

      if (seriesInstanceRef.current) {
        seriesInstanceRef.current.update(newData);
      }
    }
  }, [timestamp, price]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: "100%", height: options.height }}
    ></div>
  );
};

export default ChartComponent;
