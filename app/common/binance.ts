export class BinanceBaseUrl {
  public static readonly SPOT = "https://api.binance.com";
  public static readonly FUTURE = "https://fapi.binance.com";

  public static readonly SPOT_WS = "wss://stream.binance.com:9443/stream";
  public static readonly FUTURE_WS = "wss://fstream.binance.com/stream";
}

export class BinancePaths {
  public static readonly SPOT_EXCHANGE_INFO = "/api/v3/exchangeInfo";
  public static readonly FUTURE_EXCHANGE_INFO = "/fapi/v1/exchangeInfo";
}

export type ContractStatus =
  | "PENDING_TRADING"
  | "TRADING"
  | "PRE_DELIVERING"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED"
  | "PRE_SETTLE"
  | "SETTLING"
  | "CLOSE";

export type ContactType =
  | "PERPETUAL"
  | "CURRENT_MONTH"
  | "NEXT_MONTH"
  | "CURRENT_QUARTER"
  | "NEXT_QUARTER";

export interface FutureSymbolExchangeInfo {
  symbol: string;
  pair: string;
  contractType: ContactType;
  status: ContractStatus;
  baseAsset: string;
  quoteAsset: string;
  pricePrecision: number;
}

export interface SymbolPriceFilter {
  filterType: "PRICE_FILTER";
  minPrice: string;
  maxPrice: string;
  tickSize: string;
}

export interface SpotSymbolExchangeInfo {
  symbol: string;
  filters: SymbolPriceFilter[];
}

export interface FutureExchangeInfo {
  symbols: FutureSymbolExchangeInfo[];
}

export interface SpotExchangeInfo {
  symbols: SpotSymbolExchangeInfo[];
}

export interface ITokenData {
  symbol: string;
  pricePrecision: number;
}
