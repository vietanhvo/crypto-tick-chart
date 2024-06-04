import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BinanceBaseUrl,
  Exchange,
  KucoinBulletData,
  ProductType,
} from "@/common";
import { useChartContext } from "@/context";
import WebSocketManager from "@/lib/WebSocketManager";
import { streamTradeSymbolParser } from "@/utils/binance-utils";
import { generateId } from "@/utils/kucoin-utils";
import { timeToLocal } from "@/utils/timezone";
import { UTCTimestamp } from "lightweight-charts";

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
  kucoinBulletData: {
    [ProductType.SPOT]: KucoinBulletData;
    [ProductType.FUTURE]: KucoinBulletData;
  };
  children: React.ReactNode;
};

const ChartDataProvider: React.FC<ChartDataProviderConfig> = ({
  configs,
  kucoinBulletData,
  children,
}) => {
  const [chartData, setChartData] = useState<ChartData>({});
  const subscribedSymbolsRef = useRef<{ [key: string]: Set<string> }>({});
  const { selectedSymbols } = useChartContext();

  const subscriptionQueue = useRef<(() => Promise<void>)[]>([]);
  const isProcessingQueue = useRef(false);

  const processSubscriptionQueue = async () => {
    if (isProcessingQueue.current || subscriptionQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;

    const processNext = async () => {
      if (subscriptionQueue.current.length > 0) {
        const nextSubscription = subscriptionQueue.current.shift();
        await nextSubscription();
        await processNext();
      } else {
        isProcessingQueue.current = false;
      }
    };

    await processNext();
  };

  const getWebSocketUrl = useCallback(
    (exchange: Exchange, productType: ProductType) => {
      switch (exchange) {
        case Exchange.BINANCE:
          return productType === ProductType.FUTURE
            ? `${BinanceBaseUrl.FUTURE_WS}`
            : `${BinanceBaseUrl.SPOT_WS}`;
        case Exchange.KUCOIN:
          return `${kucoinBulletData[productType].instanceServers?.[0].endpoint}?token=${kucoinBulletData[productType].token}&connectId=${generateId()}`;
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
      let subscribedSymbolsSet = subscribedSymbolsRef.current[key];

      if (!subscribedSymbolsSet) {
        subscribedSymbolsSet = new Set();
        subscribedSymbolsRef.current[key] = subscribedSymbolsSet;
      }

      const subscriptionRequest = async () => {
        if (!subscribedSymbolsSet.has(symbol)) {
          await new Promise<void>((resolve) => {
            if (!wsManager.isConnected(exchange, productType)) {
              const url = getWebSocketUrl(exchange, productType);

              wsManager.connect(
                exchange,
                productType,
                url,
                exchange === Exchange.KUCOIN
                  ? kucoinBulletData[productType].instanceServers[0]
                      .pingInterval
                  : undefined,
                () => {
                  wsManager.subscribe(
                    exchange,
                    productType,
                    exchange === Exchange.BINANCE
                      ? streamTradeSymbolParser(symbol)
                      : symbol,
                  );
                  resolve();
                },
              );
            } else {
              wsManager.subscribe(
                exchange,
                productType,
                exchange === Exchange.BINANCE
                  ? streamTradeSymbolParser(symbol)
                  : symbol,
              );
              resolve();
            }
          });

          subscribedSymbolsSet.add(symbol);

          const handleBinanceMessage = (data: any) => {
            const { stream, data: messageData } = data;
            if (stream?.split("@")?.[1] === "trade") {
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

          const handleKucoinMessage = (data: {
            subject: string;
            data: { symbol: string; price: string; ts?: number; time?: string };
          }) => {
            const { subject, data: messageData } = data;
            if (subject === "trade.l3match" || subject === "ticker") {
              const symbolKey = messageData?.symbol?.toLowerCase();
              setChartData((prevData) => ({
                ...prevData,
                [`${exchange}_${productType}_${symbolKey}`]: {
                  price: parseFloat(messageData.price),
                  timestamp: messageData.ts
                    ? (timeToLocal(messageData.ts / 10 ** 6) as UTCTimestamp)
                    : (timeToLocal(
                        parseInt(messageData.time) / 10 ** 6,
                      ) as UTCTimestamp),
                },
              }));
            }
          };

          wsManager.onMessage(
            exchange,
            productType,
            exchange === Exchange.BINANCE
              ? handleBinanceMessage
              : handleKucoinMessage,
          );
        }
      };

      subscriptionQueue.current.push(subscriptionRequest);
      processSubscriptionQueue();
    };

    const unsubscribeFromSymbol = async (
      exchange: Exchange,
      productType: ProductType,
      symbol: string,
    ) => {
      const key = `${exchange}_${productType}`;
      const subscribedSymbolsSet = subscribedSymbolsRef.current[key];

      if (subscribedSymbolsSet && subscribedSymbolsSet.has(symbol)) {
        wsManager.unsubscribe(
          exchange,
          productType,
          exchange === Exchange.BINANCE
            ? streamTradeSymbolParser(symbol)
            : symbol,
        );
        subscribedSymbolsSet.delete(symbol);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (subscribedSymbolsSet.size === 0) {
          wsManager.closeConnection(exchange, productType);
          subscribedSymbolsRef.current[key] = new Set();
        }
      }
    };

    const currentSymbols = configs.map(({ exchange, productType, symbol }) => ({
      exchange,
      productType,
      symbol,
    }));

    const removedSymbols = Object.entries(subscribedSymbolsRef.current).reduce(
      (acc, [key, symbolSet]) => {
        const [exchange, productType] = key.split("_");
        const removedSymbolsForKey = Array.from(symbolSet).filter(
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

    removedSymbols.forEach(async ({ exchange, productType, symbol }) => {
      await unsubscribeFromSymbol(
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
