"use client";

import React, { useCallback, useEffect, useRef } from "react";

import { useChartContext } from "@/context";
import { useChartData } from "@/context/ChartDataProvider";
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

const ChartComponent: React.FC<{ id: string }> = ({ id }) => {
  const { selectedSymbolMap } = useChartContext();
  const selectedSymbol = selectedSymbolMap.get(id);
  const { chartData } = useChartData();

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
    const chart = createChart(chartContainerRef.current, {
      ...options,
      width: chartContainerRef.current.clientWidth,
    });

    chartInstanceRef.current = chart;

    return () => {
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (selectedSymbol?.data?.pricePrecision) {
      if (seriesInstanceRef.current) {
        chartInstanceRef.current?.removeSeries(seriesInstanceRef.current);
      }

      seriesInstanceRef.current = chartInstanceRef.current.addLineSeries({
        lineWidth: 1,
        color: "#AF5F5F",
        priceFormat: {
          type: "price",
          precision: selectedSymbol.data.pricePrecision,
          minMove: 1 / Math.pow(10, selectedSymbol.data.pricePrecision),
        },
      });
      seriesInstanceRef.current.setData(initialData);
    }
  }, [selectedSymbol?.data?.pricePrecision]);

  useEffect(() => {
    if (seriesInstanceRef.current) {
      seriesInstanceRef.current.setData(initialData);
    }
  }, [
    selectedSymbol?.exchange,
    selectedSymbol?.productType,
    selectedSymbol?.data?.symbol,
  ]);

  useEffect(() => {
    if (
      !selectedSymbol?.data ||
      !selectedSymbol?.exchange ||
      !selectedSymbol?.productType
    ) {
      return;
    }

    const currentData =
      chartData[
        `${selectedSymbol.exchange}_${selectedSymbol.productType}_${selectedSymbol.data.symbol.toLowerCase()}`
      ];

    if (!currentData || !currentData.timestamp || currentData.price === null) {
      return;
    }

    if (seriesInstanceRef.current) {
      const newData: LineData<UTCTimestamp> = {
        time: currentData.timestamp,
        value: currentData.price,
      };

      seriesInstanceRef.current.update(newData);
    }
  }, [chartData]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: "100%", height: options.height }}
    ></div>
  );
};

export default ChartComponent;
