import { Exchange, ProductType, SocketConfiguration } from "@/common";

class WebSocketManager {
  private static instance: WebSocketManager;
  private sockets: Map<string, Map<string, WebSocket>> = new Map();
  private connectedExchanges: Set<string> = new Set();
  private connectedProductTypes: Map<string, Set<string>> = new Map();
  private subscribedSymbols: Map<string, Map<string, Map<string, number>>> =
    new Map();
  private onMessageCallbacks: Map<string, Map<string, (data: any) => void>> =
    new Map();
  private connectionTimestamps: Map<string, Map<string, number>> = new Map();
  private idCounter: Map<string, Map<string, number>> = new Map();

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private initializeExchangeMaps(exchange: string) {
    if (!this.sockets.has(exchange)) {
      this.sockets.set(exchange, new Map());
      this.subscribedSymbols.set(exchange, new Map());
      this.onMessageCallbacks.set(exchange, new Map());
      this.connectionTimestamps.set(exchange, new Map());
      this.idCounter.set(exchange, new Map());
    }
  }

  private reconnect(exchange: Exchange, type: ProductType, url: string) {
    console.log(
      `Reconnecting WebSocket for exchange: ${exchange}, type: ${type}`,
    );
    this.connect(exchange, type, url, () => {
      const subscribedSymbols = this.subscribedSymbols.get(exchange)?.get(type);
      if (subscribedSymbols) {
        subscribedSymbols.forEach((_id, symbol) => {
          this.subscribe(exchange, type, symbol);
        });
      }
    });
  }

  public isConnected(exchange: string, type: string): boolean {
    return (
      this.connectedExchanges.has(exchange) &&
      this.connectedProductTypes.get(exchange)?.has(type)
    );
  }

  public connect(
    exchange: Exchange,
    type: ProductType,
    url: string,
    onOpen?: () => void,
    onClose?: () => void,
  ) {
    if (this.isConnected(exchange, type)) {
      return;
    }

    this.initializeExchangeMaps(exchange);

    const exchangeSockets = this.sockets.get(exchange);
    if (!exchangeSockets.has(type)) {
      const socket = new WebSocket(url);

      // Send ping-pong
      let pingInterval: NodeJS.Timeout;

      if (SocketConfiguration[exchange]?.pingPongInterval) {
        pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send("ping");
          }
        }, SocketConfiguration[exchange].pingPongInterval);
      }

      socket.onopen = () => {
        console.log(
          `WebSocket connected for exchange: ${exchange}, type: ${type}`,
        );
        if (onOpen) onOpen();

        this.connectionTimestamps.get(exchange)?.set(type, Date.now());
      };

      socket.onmessage = (event) => {
        const callback = this.onMessageCallbacks.get(exchange)?.get(type);
        if (callback) {
          callback(JSON.parse(event.data));
        }
      };

      socket.onclose = () => {
        console.log(
          `WebSocket closed for exchange: ${exchange}, type: ${type}`,
        );
        exchangeSockets.delete(type);

        if (pingInterval) {
          clearInterval(pingInterval);
        }

        if (onClose) onClose();

        const connectionTimestamp = this.connectionTimestamps
          .get(exchange)
          ?.get(type);
        if (
          SocketConfiguration[exchange]?.connectionDuration &&
          connectionTimestamp &&
          Date.now() - connectionTimestamp >=
            SocketConfiguration[exchange].connectionDuration
        ) {
          setTimeout(() => {
            this.reconnect(exchange, type, url);
          }, 5000);
        }
      };

      exchangeSockets.set(type, socket);
      this.subscribedSymbols.get(exchange).set(type, new Map());

      this.connectedExchanges.add(exchange);
      if (!this.connectedProductTypes.has(exchange)) {
        this.connectedProductTypes.set(exchange, new Set());
      }
      this.connectedProductTypes.get(exchange).add(type);
    }
  }

  public subscribe(exchange: Exchange, type: ProductType, symbol: string) {
    const subscribedSymbols = this.subscribedSymbols.get(exchange)?.get(type);
    if (subscribedSymbols && !subscribedSymbols.has(symbol)) {
      const id = this.getNextId(exchange, type);
      subscribedSymbols.set(symbol, id);
      const socket = this.sockets.get(exchange)?.get(type);
      socket?.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [symbol],
          id,
        }),
      );
    }
  }

  public unsubscribe(exchange: Exchange, type: ProductType, symbol: string) {
    const subscribedSymbols = this.subscribedSymbols.get(exchange)?.get(type);
    if (subscribedSymbols && subscribedSymbols.has(symbol)) {
      const id = subscribedSymbols.get(symbol);
      subscribedSymbols.delete(symbol);
      const socket = this.sockets.get(exchange)?.get(type);
      socket?.send(
        JSON.stringify({
          method: "UNSUBSCRIBE",
          params: [symbol],
          id,
        }),
      );
    }
  }

  public onMessage(
    exchange: Exchange,
    type: ProductType,
    callback: (data: any) => void,
  ) {
    const exchangeCallbacks = this.onMessageCallbacks.get(exchange);
    if (exchangeCallbacks) {
      exchangeCallbacks.set(type, callback);
    }
  }

  public getSocketInstance(exchange: Exchange, type: ProductType) {
    return this.sockets.get(exchange)?.get(type);
  }

  private getNextId(exchange: Exchange, type: ProductType) {
    const exchangeIdCounter = this.idCounter.get(exchange);
    if (!exchangeIdCounter.has(type)) {
      exchangeIdCounter.set(type, 1);
    }
    const currentId = exchangeIdCounter.get(type);
    exchangeIdCounter.set(type, currentId + 1);
    return currentId;
  }

  public closeConnection(exchange: Exchange, type: ProductType) {
    const socket = this.sockets.get(exchange)?.get(type);
    if (socket) {
      socket.close();
      this.sockets.get(exchange).delete(type);
      this.subscribedSymbols.get(exchange).delete(type);
      this.onMessageCallbacks.get(exchange).delete(type);
      this.connectionTimestamps.get(exchange).delete(type);
      this.idCounter.get(exchange).delete(type);

      if (this.sockets.get(exchange).size === 0) {
        this.sockets.delete(exchange);
        this.subscribedSymbols.delete(exchange);
        this.onMessageCallbacks.delete(exchange);
        this.connectionTimestamps.delete(exchange);
        this.idCounter.delete(exchange);
        this.connectedExchanges.delete(exchange);
      }
    }
  }
}

export default WebSocketManager;
