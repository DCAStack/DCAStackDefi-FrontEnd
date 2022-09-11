import useSWR from "swr";
import React, { useState } from "react";
import {
  parseEther,
  formatUnits,
  parseUnits,
  formatEther,
} from "ethers/lib/utils";
import { IToken } from "../../models/Interfaces";
import { nullToken } from "../../data/gasTokens";
import { BigNumber } from "ethers";
import Big from "big.js";
import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import { useFeeData } from "wagmi";

export default function use1inchRetrieveQuote(
  currentChain: number,
  sellCrypto: IToken,
  buyCrypto: IToken,
  tradeAmount: string,
  tradeFreq: number,
  startDate: Date | null,
  endDate: Date | null,
  numExec: number,
  alreadyFormatted?: boolean,
  bufferMultiplier: number = 2
) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const [feeData, setFeeData] = useState(BigNumber.from(0));

  useFeeData({
    watch: false, //prevent changing gas prices
    onSuccess(data) {
      console.log("Retrieved fee data:", data);
      setFeeData(data.maxFeePerGas ? data.maxFeePerGas : BigNumber.from(0));
    },
    onError(error) {
      console.error("Could not retrieve fee data:", error);
      setFeeData(BigNumber.from(0));
    },
  });

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

  const readyUrl = `https://api.1inch.io/v4.0/${currentChain}/quote?fromTokenAddress=${sellCrypto.address}&toTokenAddress=${buyCrypto.address}&amount=${tradeAmountFormatted}`;

  const { data, error } = useSWR(
    sellCrypto !== nullToken &&
      buyCrypto !== nullToken &&
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
    console.log("1inch fetch quote success", data, feeData.toString());
    if (data?.estimatedGas) {
      data.estimatedGasSingleTradeWei = BigNumber.from(data.estimatedGas).mul(
        feeData
      );
      data.estimatedGasFormatted = formatEther(data.estimatedGasSingleTradeWei);

      let calcGas = data.estimatedGasSingleTradeWei
        .mul(numExec)
        .mul(bufferMultiplier);

      data.estimatedGasDcaFormatted = formatEther(calcGas.toString());
      data.estimatedGasDca = BigNumber.from(
        parseEther(data.estimatedGasDcaFormatted)
      );
    }

    if (data?.toTokenAmount && data?.fromTokenAmount) {
      const bnToAmount = Big(
        formatUnits(data.toTokenAmount, buyCrypto.decimals)
      );
      const bnFromAmount = Big(
        formatUnits(data.fromTokenAmount, sellCrypto.decimals)
      );

      data.swapQuote = bnToAmount.div(bnFromAmount).toString();
    }

    if (data.statusCode) {
      console.error("1inch fetch quote error", data.error);
      showNotification({
        id: "1inch-quote-error",
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
    console.error("1inch fetch quote error", error);
    showNotification({
      id: "1inch-quote-error",
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
