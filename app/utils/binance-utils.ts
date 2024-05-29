export const streamAggTradeSymbolParser = (symbol: string) => {
  return `${symbol.toLowerCase()}@aggTrade`;
};
