import {
  BinanceBaseUrl,
  BinancePaths,
  Exchange,
  FutureExchangeInfo,
  ITokenData,
  KucoinBaseUrl,
  KucoinBulletData,
  KucoinFutureActiveContract,
  KucoinPaths,
  KucoinSpotSymbol,
  ProductType,
  SpotExchangeInfo,
} from "@/common";
import baseDataProviderService from "@/data-provider";
import { ChartProvider } from "./context";
import {
  countDigitsAfterDecimal,
  countSignificantDecimals,
} from "./utils/parse";
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
          pricePrecision: countSignificantDecimals(
            data.filters.find((data) => data.filterType === "PRICE_FILTER")
              .tickSize,
          ),
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

async function fetchKucoinFutureBulletData(): Promise<KucoinBulletData> {
  const bulletConfig = await baseDataProviderService.send<{
    data: { data: KucoinBulletData };
  }>({
    baseUrl: KucoinBaseUrl.FUTURE,
    resource: KucoinPaths.BULLET_PUBLIC,
    params: {
      method: "POST",
    },
  });

  return bulletConfig?.data?.data;
}

async function fetchKucoinSpotBulletData(): Promise<KucoinBulletData> {
  const bulletConfig = await baseDataProviderService.send<{
    data: { data: KucoinBulletData };
  }>({
    baseUrl: KucoinBaseUrl.SPOT,
    resource: KucoinPaths.BULLET_PUBLIC,
    params: {
      method: "POST",
    },
  });

  return bulletConfig?.data?.data;
}

export default async function Page() {
  const [
    binanceFutureTokenDatas,
    binanceSpotTokenDatas,
    kucoinFutureTokenDatas,
    kucoinSpotTokenDatas,
    kucoinFutureBulletData,
    kucoinSpotBulletData,
  ] = await Promise.all([
    fetchFutureSymbols(Exchange.BINANCE),
    fetchSpotSymbols(Exchange.BINANCE),
    fetchFutureSymbols(Exchange.KUCOIN),
    fetchSpotSymbols(Exchange.KUCOIN),
    fetchKucoinFutureBulletData(),
    fetchKucoinSpotBulletData(),
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
      <ChartContainersWrapper
        kucoinBulletData={{
          [ProductType.SPOT]: kucoinSpotBulletData,
          [ProductType.FUTURE]: kucoinFutureBulletData,
        }}
      />
    </ChartProvider>
  );
}
