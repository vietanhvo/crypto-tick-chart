import { BinanceBaseUrl, Exchange, ProductType } from "@/common";
import WebSocketManager from "@/lib/WebSocketManager";
import { streamAggTradeSymbolParser } from "@/utils/binance-utils";
import { timeToLocal } from "@/utils/timezone";
import { UTCTimestamp } from "lightweight-charts";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useChartContext } from "./ChartContext";

type ChartData = {
  [key: string]: { price: number | null; timestamp: UTCTimestamp | null };
};

type ChartDataContextType = {
  chartData: ChartData;
};

const ChartDataContext = createContext<ChartDataContextType>({
  chartData: {},
});

export const useChartData = () => useContext(ChartDataContext);

type ChartDataProviderProps = {
  exchange: Exchange;
  productType: ProductType;
  symbol: string;
};

type ChartDataProviderConfig = {
  configs: ChartDataProviderProps[];
  onConnect?: (connect: () => void) => void;
  children: React.ReactNode;
};

const ChartDataProvider: React.FC<ChartDataProviderConfig> = ({
  configs,
  children,
}) => {
  const [chartData, setChartData] = useState<ChartData>({});
  const subscribedSymbolsRef = useRef<{ [key: string]: Map<string, number> }>(
    {},
  );
  const { selectedSymbols } = useChartContext();
  const idCounterRef = useRef(1);

  const subscriptionQueue = useRef<(() => void)[]>([]);
  const isProcessingQueue = useRef(false);

  const processSubscriptionQueue = () => {
    if (isProcessingQueue.current || subscriptionQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;

    const processNext = () => {
      if (subscriptionQueue.current.length > 0) {
        const nextSubscription = subscriptionQueue.current.shift();
        nextSubscription();
        setTimeout(processNext, 400);
      } else {
        isProcessingQueue.current = false;
      }
    };

    processNext();
  };

  const getWebSocketUrl = useCallback(
    (exchange: Exchange, productType: ProductType) => {
      switch (exchange) {
        case Exchange.BINANCE:
          return productType === ProductType.FUTURE
            ? `${BinanceBaseUrl.FUTURE_WS}`
            : `${BinanceBaseUrl.SPOT_WS}`;
        case Exchange.KUCOIN:
          return "";
        default:
          return "";
      }
    },
    [],
  );

  useEffect(() => {
    const wsManager = WebSocketManager.getInstance();

    const subscribeToSymbol = (
      exchange: Exchange,
      productType: ProductType,
      symbol: string,
    ) => {
      const key = `${exchange}_${productType}`;
      const subscribedSymbolsMap =
        subscribedSymbolsRef.current[key] || new Map();

      const subscriptionRequest = () => {
        if (!subscribedSymbolsMap.has(symbol)) {
          const id = idCounterRef.current++;

          if (!wsManager.isConnected(exchange, productType)) {
            const url = getWebSocketUrl(exchange, productType);

            wsManager.connect(exchange, productType, url, () => {
              wsManager.subscribe(
                exchange,
                productType,
                streamAggTradeSymbolParser(symbol),
              );
            });
          } else {
            wsManager.subscribe(
              exchange,
              productType,
              streamAggTradeSymbolParser(symbol),
            );
          }

          subscribedSymbolsMap.set(symbol, id);
          subscribedSymbolsRef.current[key] = subscribedSymbolsMap;

          const handleMessage = (data: any) => {
            const { stream, data: messageData } = data;
            if (stream?.split("@")?.[1] === "aggTrade") {
              const symbolKey = stream.split("@")[0].toLowerCase();
              setChartData((prevData) => ({
                ...prevData,
                [`${exchange}_${productType}_${symbolKey}`]: {
                  price: parseFloat(messageData.p),
                  timestamp: timeToLocal(messageData.T) as UTCTimestamp,
                },
              }));
            }
          };

          wsManager.onMessage(exchange, productType, handleMessage);
        }
      };

      subscriptionQueue.current.push(subscriptionRequest);
      processSubscriptionQueue();
    };

    const unsubscribeFromSymbol = (
      exchange: Exchange,
      productType: ProductType,
      symbol: string,
    ) => {
      const key = `${exchange}_${productType}`;
      const subscribedSymbolsMap = subscribedSymbolsRef.current[key];

      if (subscribedSymbolsMap && subscribedSymbolsMap.has(symbol)) {
        wsManager.unsubscribe(exchange, productType, symbol);
        subscribedSymbolsMap.delete(symbol);

        if (subscribedSymbolsMap.size === 0) {
          wsManager.closeConnection(exchange, productType);
        }
      }
    };

    const currentSymbols = configs.map(({ exchange, productType, symbol }) => ({
      exchange,
      productType,
      symbol,
    }));

    const removedSymbols = Object.entries(subscribedSymbolsRef.current).reduce(
      (acc, [key, symbolMap]) => {
        const [exchange, productType] = key.split("_");
        const removedSymbolsForKey = Array.from(symbolMap.keys()).filter(
          (symbol) =>
            !currentSymbols.some(
              (config) =>
                config.exchange === exchange &&
                config.productType === productType &&
                config.symbol === symbol,
            ),
        );
        return [
          ...acc,
          ...removedSymbolsForKey.map((symbol) => ({
            exchange,
            productType,
            symbol,
          })),
        ];
      },
      [],
    );

    currentSymbols.forEach(({ exchange, productType, symbol }) => {
      if (exchange && productType && symbol) {
        subscribeToSymbol(
          exchange as Exchange,
          productType as ProductType,
          symbol,
        );
      }
    });

    removedSymbols.forEach(({ exchange, productType, symbol }) => {
      unsubscribeFromSymbol(
        exchange as Exchange,
        productType as ProductType,
        symbol,
      );
    });
  }, [configs, selectedSymbols]);

  return (
    <ChartDataContext.Provider value={{ chartData }}>
      {children}
    </ChartDataContext.Provider>
  );
};

export default ChartDataProvider;
