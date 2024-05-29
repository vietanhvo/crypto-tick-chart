import {
  BinanceBaseUrl,
  BinancePaths,
  Exchange,
  FutureExchangeInfo,
  ITokenData,
  KucoinBaseUrl,
  KucoinFutureActiveContract,
  KucoinPaths,
  KucoinSpotSymbol,
  ProductType,
  SpotExchangeInfo,
} from "@/common";
import baseDataProviderService from "@/data-provider";
import { ChartProvider } from "./context";
import { countDigitsAfterDecimal } from "./utils/parse";
import ChartContainersWrapper from "./components/ChartContainerWrapper";

async function fetchFutureSymbols(exchange: Exchange): Promise<ITokenData[]> {
  try {
    switch (exchange) {
      case Exchange.BINANCE: {
        const response = await baseDataProviderService.send<{
          data: FutureExchangeInfo;
        }>({
          baseUrl: BinanceBaseUrl.FUTURE,
          resource: BinancePaths.FUTURE_EXCHANGE_INFO,
          params: {
            method: "GET",
          },
        });

        return response?.data?.symbols?.map((data) => ({
          symbol: data.symbol,
          pricePrecision: data.pricePrecision,
        }));
      }
      case Exchange.KUCOIN: {
        const response = await baseDataProviderService.send<{
          data: { data: KucoinFutureActiveContract[] };
        }>({
          baseUrl: KucoinBaseUrl.FUTURE,
          resource: KucoinPaths.FUTURE_ACTIVE_CONTRACTS,
          params: {
            method: "GET",
          },
        });

        return response?.data?.data?.map((data) => ({
          symbol: data.symbol,
          pricePrecision: countDigitsAfterDecimal(data.indexPriceTickSize),
        }));
      }
      default: {
        break;
      }
    }
  } catch (error) {
    console.error("Failed to fetch symbols:", error);
    return [];
  }
}

async function fetchSpotSymbols(exchange: Exchange): Promise<ITokenData[]> {
  try {
    switch (exchange) {
      case Exchange.BINANCE: {
        const response = await baseDataProviderService.send<{
          data: SpotExchangeInfo;
        }>({
          baseUrl: BinanceBaseUrl.SPOT,
          resource: BinancePaths.SPOT_EXCHANGE_INFO,
          params: {
            method: "GET",
          },
        });

        return response?.data?.symbols?.map((data) => ({
          symbol: data.symbol,
          pricePrecision: data.baseAssetPrecision,
        }));
      }
      case Exchange.KUCOIN: {
        const response = await baseDataProviderService.send<{
          data: { data: KucoinSpotSymbol[] };
        }>({
          baseUrl: KucoinBaseUrl.SPOT,
          resource: KucoinPaths.SPOT_SYMBOLS,
          params: {
            method: "GET",
          },
        });

        return response?.data?.data
          ?.filter((data) => data.enableTrading)
          ?.map((data) => ({
            symbol: data.symbol,
            pricePrecision: countDigitsAfterDecimal(
              parseFloat(data.priceIncrement),
            ),
          }));
      }
    }
  } catch (error) {
    console.error("Failed to fetch symbols:", error);
    return [];
  }
}

export default async function Page() {
  const [
    binanceFutureTokenDatas,
    binanceSpotTokenDatas,
    kucoinFutureTokenDatas,
    kucoinSpotTokenDatas,
  ] = await Promise.all([
    fetchFutureSymbols(Exchange.BINANCE),
    fetchSpotSymbols(Exchange.BINANCE),
    fetchFutureSymbols(Exchange.KUCOIN),
    fetchSpotSymbols(Exchange.KUCOIN),
  ]);

  const allSymbols: Record<Exchange, Record<ProductType, ITokenData[]>> = {
    Binance: {
      Future: binanceFutureTokenDatas,
      Spot: binanceSpotTokenDatas,
    },
    Kucoin: {
      Future: kucoinFutureTokenDatas,
      Spot: kucoinSpotTokenDatas,
    },
  };

  return (
    <ChartProvider allSymbols={allSymbols}>
      <ChartContainersWrapper />
    </ChartProvider>
  );
}
