export const streamTradeSymbolParser = (symbol: string) => {
  return `${symbol.toLowerCase()}@trade`;
};
