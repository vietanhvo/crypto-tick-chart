export class KucoinBaseUrl {
  public static readonly SPOT = "https://api.kucoin.com";
  public static readonly FUTURE = "https://api-futures.kucoin.com";
}

export class KucoinPaths {
  public static readonly SPOT_SYMBOLS = "/api/v2/symbols";
  public static readonly FUTURE_ACTIVE_CONTRACTS = "/api/v1/contracts/active";
}

export interface KucoinSpotSymbol {
  symbol: string;
  priceIncrement: string;
  enableTrading: boolean;
}

export interface KucoinFutureActiveContract {
  symbol: string;
  indexPriceTickSize: number;
}
