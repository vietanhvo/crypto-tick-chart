"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Exchange, ITokenData, ProductType } from "@/common";
import { Map } from "immutable";
import { generateUniqueId } from "@/utils/genarator";

export type TSelectedSymbol = {
  id: string;
  exchange: string;
  productType: string;
  data: ITokenData;
};

interface IChartContextProps {
  exchanges: string[];
  exchangeProducts: Record<string, string[]>;
  allSymbols: Record<string, Record<string, ITokenData[]>>;

  selectedSymbols: Array<TSelectedSymbol>;
  selectedSymbolMap: Map<string, Omit<TSelectedSymbol, "id">>;

  select: (opts: {
    id: string;
    data: Partial<Omit<TSelectedSymbol, "id">>;
  }) => void;
  addSelectSymbol: (opts: Omit<TSelectedSymbol, "id">) => void;
  removeSelectSymbol: (opts: string) => void;
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
  const [selectedSymbolMap, setSelectedSymbolMap] =
    useState<Map<string, Omit<TSelectedSymbol, "id">>>(Map());

  const isFirstRender = useRef(true);

  const addSelectSymbol = useCallback(
    (opts: Omit<TSelectedSymbol, "id">) => {
      const id = generateUniqueId();
      setSelectedSymbols((prev) => [...prev, { ...opts, id }]);
      setSelectedSymbolMap((prev) => Map(prev).set(id, opts));
    },
    [generateUniqueId, setSelectedSymbols, setSelectedSymbolMap],
  );

  const removeSelectSymbol = useCallback(
    (id: string) => {
      setSelectedSymbols((prev) => prev.filter((symbol) => symbol.id !== id));
      setSelectedSymbolMap((prev) => Map(prev).delete(id));
    },
    [setSelectedSymbols, setSelectedSymbolMap],
  );

  const select = useCallback(
    (props: { id: string; data: Partial<Omit<TSelectedSymbol, "id">> }) => {
      const { id, data } = props;
      setSelectedSymbols((prevSymbols) => {
        return prevSymbols.map((symbol) => {
          if (symbol.id === id) {
            return { ...symbol, ...data };
          }
          return symbol;
        });
      });

      setSelectedSymbolMap((prevMap) => {
        const updatedMap = Map(prevMap);
        return updatedMap.set(id, { ...updatedMap.get(id), ...data });
      });
    },
    [setSelectedSymbols, setSelectedSymbolMap],
  );

  const getExchangeProducts = useCallback(
    (props: Record<string, Record<string, ITokenData[]>>) => {
      const exchangeProducts: Record<string, string[]> = {};
      for (const exchange in props) {
        exchangeProducts[exchange] = Object.keys(props[exchange]);
      }
      return exchangeProducts;
    },
    [],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSymbols = localStorage.getItem("selectedSymbols");
      if (storedSymbols) {
        const parsedSymbols = JSON.parse(
          storedSymbols,
        ) as Array<TSelectedSymbol>;

        setSelectedSymbols(parsedSymbols);

        setSelectedSymbolMap(
          parsedSymbols.reduce((map, symbol) => {
            const { id, ...rest } = symbol;
            return map.set(id, rest);
          }, Map<string, Omit<TSelectedSymbol, "id">>()),
        );
      }
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSymbols", JSON.stringify(selectedSymbols));
    }
  }, [selectedSymbols]);

  return (
    <ChartContext.Provider
      value={{
        exchanges: Object.keys(allSymbols),
        exchangeProducts: getExchangeProducts(allSymbols),
        allSymbols,
        selectedSymbols,
        selectedSymbolMap,

        select,
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
