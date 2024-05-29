import { BinanceBaseUrl, Exchange, ProductType } from "@/common";
import { timeToLocal } from "@/utils/timezone";
import { UTCTimestamp } from "lightweight-charts";
import { useEffect, useState, useRef, useCallback } from "react";

const useChartSocket = (
  exchange: Exchange,
  productType: ProductType,
  symbol: string,
) => {
  const [price, setPrice] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<UTCTimestamp | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    if (!symbol) return;

    let baseUrl = "";
    switch (exchange) {
      case Exchange.BINANCE:
        baseUrl =
          productType === ProductType.FUTURE
            ? BinanceBaseUrl.FUTURE_WS
            : BinanceBaseUrl.SPOT_WS;
        baseUrl += `/ws/${symbol.toLowerCase()}@aggTrade`;
        break;
      case Exchange.KUCOIN:
        break;
      default:
        return;
    }

    const socket = new WebSocket(baseUrl);

    socket.onopen = () => {
      console.log("WebSocket connected!");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPrice(parseFloat(data.p));
        setTimestamp(timeToLocal(data.T) as UTCTimestamp);
      } catch (err) {
        console.error("Error parsing data:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed!");
    };

    socketRef.current = socket;
  }, [exchange, productType, symbol]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connectWebSocket]);

  return { price, timestamp };
};

export default useChartSocket;
