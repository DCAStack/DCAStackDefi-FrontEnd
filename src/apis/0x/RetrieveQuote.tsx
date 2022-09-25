import useSWR from "swr";
import { parseEther, parseUnits, formatEther } from "ethers/lib/utils";
import { IToken } from "../../models/Interfaces";
import { nullToken } from "../../data/gasTokens";
import { BigNumber } from "ethers";
import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import RetrieveUserInfo from "../../components/Dashboard/RetrieveUserInfo";
import EstimateGas from "../../components/Banking/EstimateGas";
import { apiEndpoint } from "./endPoints";

export function createQueryString(
  params: { [s: string]: unknown } | ArrayLike<unknown>
) {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

export default function use0xRetrieveQuote(
  currentChain: number,
  sellCrypto: IToken,
  buyCrypto: IToken,
  tradeAmount: string,
  tradeFreq: number,
  startDate: Date | null,
  endDate: Date | null,
  numExec: number,
  fetchScheduleEstimates: boolean = true,
  alreadyFormatted?: boolean,
  bufferMultiplier: number = 2
) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  if (currentChain === 31337) {
    //help with local testing
    currentChain = 1;
  }

  let tradeAmountFormatted = "0";
  if (alreadyFormatted) {
    tradeAmountFormatted = tradeAmount;
  } else {
    tradeAmountFormatted =
      sellCrypto?.decimals !== 0
        ? parseUnits(
            tradeAmount !== "" ? tradeAmount : "0",
            sellCrypto?.decimals
          ).toString()
        : "0";
  }

  const { mappedTokenBalances, userSchedules } = RetrieveUserInfo();
  const { estimatedGas } = EstimateGas(mappedTokenBalances, userSchedules);

  let bufferAddWei = BigNumber.from(0);
  if (fetchScheduleEstimates) {
    bufferAddWei = estimatedGas;
    console.log("buffer added", bufferAddWei.toString());
  }

  const qs = createQueryString({
    sellToken: sellCrypto.address,
    buyToken: buyCrypto.address,
    sellAmount: tradeAmountFormatted,
    slippagePercentage: 0.01,
  });

  const readyUrl = `${apiEndpoint[currentChain]}swap/v1/quote?${qs}`;

  const { data, error } = useSWR(
    sellCrypto !== nullToken &&
      buyCrypto !== nullToken &&
      sellCrypto !== buyCrypto &&
      tradeAmountFormatted !== "0" &&
      tradeFreq > 0 &&
      startDate !== null &&
      endDate !== null &&
      numExec !== 0 &&
      currentChain !== 0
      ? readyUrl
      : null,
    fetcher
  );

  if (data) {
    console.log("0x fetch quote success", data);
    if (data?.estimatedGas) {
      data.estimatedGasSingleTradeWei = BigNumber.from(data.estimatedGas)
        .mul(data.gasPrice)
        .add(bufferAddWei);

      data.estimatedGasFormattedMin = formatEther(
        data.estimatedGasSingleTradeWei
      );

      //buffer used for single trade calcs
      data.estimatedGasSingleTrade =
        data.estimatedGasSingleTradeWei.mul(bufferMultiplier);

      data.estimatedGasFormatted = formatEther(
        data.estimatedGasSingleTrade.toString()
      );

      let calcGas = data.estimatedGasSingleTradeWei
        .mul(numExec)
        .mul(bufferMultiplier);

      data.estimatedGasDcaFormatted = formatEther(calcGas.toString());
      data.estimatedGasDca = BigNumber.from(
        parseEther(data.estimatedGasDcaFormatted)
      );

      data.estimatedGasDcaFormattedSafe = formatEther(
        calcGas.mul(bufferMultiplier).toString()
      );
      data.estimatedGasDcaSafe = BigNumber.from(
        parseEther(data.estimatedGasDcaFormattedSafe)
      );

      let minGas = data.estimatedGasSingleTradeWei.mul(numExec);

      data.minGasDcaFormatted = formatEther(minGas.toString());
      data.minGasDca = BigNumber.from(parseEther(data.minGasDcaFormatted));
      data.swapQuote = data.price;
    }

    if (data.statusCode) {
      console.error("0x fetch quote error", data.error);
      showNotification({
        id: "0x-quote-error",
        color: "red",
        title: "Error Fetching Swap Details",
        message: data.description,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    }
  }

  if (error) {
    console.error("0x fetch quote error", error);
    showNotification({
      id: "0x-quote-error",
      color: "red",
      title: "Error Fetching Swap Details",
      message: error.message,
      autoClose: true,
      disallowClose: false,
      icon: <AlertOctagon />,
    });
  }

  return {
    quote: data,
    isLoading: !error && !data,
    isError: error,
  };
}
