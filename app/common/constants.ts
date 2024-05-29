export const enum Exchange {
  BINANCE = "Binance",
  KUCOIN = "Kucoin",
}

export const enum ProductType {
  FUTURE = "Future",
  SPOT = "Spot",
}

export const SocketConfiguration: Record<
  Exchange,
  { pingPongInterval: number; connectionDuration: number }
> = {
  [Exchange.BINANCE]: {
    pingPongInterval: 0, // Binance don't need it
    connectionDuration: 24 * 60 * 60 * 1000,
  },
  [Exchange.KUCOIN]: {
    pingPongInterval: 60000,
    connectionDuration: 1800000,
  },
};
