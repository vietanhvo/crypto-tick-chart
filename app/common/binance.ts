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

export interface FuturesSymbolExchangeInfo {
  symbol: string;
  pair: string;
  contractType: ContactType;
  status: ContractStatus;
  baseAsset: string;
  quoteAsset: string;
}

export interface FuturesExchangeInfo {
  symbols: FuturesSymbolExchangeInfo[];
}
