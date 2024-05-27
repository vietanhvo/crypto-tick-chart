import { timeToLocal } from "@/utils/timezone";
import { UTCTimestamp } from "lightweight-charts";
import { useEffect, useState, useRef } from "react";

const useBinanceFuturesSocket = (symbol: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<UTCTimestamp | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;

    socketRef.current = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@aggTrade`,
    );

    socketRef.current.onopen = () => {
      console.log("WebSocket connected!");
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setPrice(parseFloat(data.p));
        setTimestamp(timeToLocal(data.T) as UTCTimestamp);
      } catch (err) {
        console.error("Error parsing data:", err);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket closed!");
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [symbol]);

  return { timestamp, price };
};

export default useBinanceFuturesSocket;
