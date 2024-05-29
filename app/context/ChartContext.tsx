"use client";

import React, { createContext, useContext, useState } from "react";

import { Exchange, ITokenData, ProductType } from "@/common";

type TSelectedSymbol = {
  exchange: string;
  productType: string;
  data: ITokenData;
};

interface IChartContextProps {
  exchanges: string[];
  exchangeProducts: Record<string, string[]>;
  allSymbols: Record<string, Record<string, ITokenData[]>>;

  selectedSymbols: Array<TSelectedSymbol>;

  setSelectedSymbols: React.Dispatch<
    React.SetStateAction<Array<TSelectedSymbol>>
  >;
  addSelectSymbol: (opts: TSelectedSymbol) => void;
  removeSelectSymbol: (opts: number) => void;
}

const ChartContext = createContext<IChartContextProps | undefined>(undefined);

interface IChartProviderProps {
  allSymbols: Record<Exchange, Record<ProductType, ITokenData[]>>;
  children: React.ReactNode;
}

export const ChartProvider: React.FC<IChartProviderProps> = ({
  allSymbols,
  children,
}) => {
  const [selectedSymbols, setSelectedSymbols] = useState<
    Array<TSelectedSymbol>
  >([]);

  const addSelectSymbol = (opts: TSelectedSymbol) => {
    return setSelectedSymbols((prev) => [...prev, opts]);
  };

  const removeSelectSymbol = (index: number) => {
    return setSelectedSymbols((prev) => {
      const updatedSymbols = [...prev];
      updatedSymbols.splice(index, 1);
      return updatedSymbols;
    });
  };

  const getExchangeProducts = (
    props: Record<string, Record<string, ITokenData[]>>,
  ) => {
    const exchangeProducts: Record<string, string[]> = {};
    for (const exchange in props) {
      exchangeProducts[exchange] = Object.keys(props[exchange]);
    }
    return exchangeProducts;
  };

  return (
    <ChartContext.Provider
      value={{
        exchanges: Object.keys(allSymbols),
        exchangeProducts: getExchangeProducts(allSymbols),
        allSymbols,
        selectedSymbols,

        setSelectedSymbols,
        addSelectSymbol,
        removeSelectSymbol,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};

export const useChartContext = (): IChartContextProps => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider");
  }
  return context;
};
