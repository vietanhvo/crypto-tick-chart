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
  { connectionDuration: number }
> = {
  [Exchange.BINANCE]: {
    connectionDuration: 24 * 60 * 60 * 1000,
  },
  [Exchange.KUCOIN]: {
    connectionDuration: 24 * 60 * 60 * 1000,
  },
};
