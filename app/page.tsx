import { BinancePaths, FuturesExchangeInfo } from "@/common";
import baseDataProviderService from "@/data-provider";
import ChartContainerWrapper from "./components/ChartContainerWrapper";

async function fetchSymbols() {
  try {
    const response = await baseDataProviderService.send<{
      data: FuturesExchangeInfo;
    }>({
      resource: BinancePaths.EXCHANGE_INFO,
      params: {
        method: "GET",
      },
    });

    return response?.data?.symbols?.map((data) => data.symbol);
  } catch (error) {
    console.error("Failed to fetch symbols:", error);
    return [];
  }
}

export default async function Page() {
  const symbols = await fetchSymbols();

  return <ChartContainerWrapper symbols={symbols} />;
}
