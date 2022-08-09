import useSWR from "swr";
import React, { useState } from "react";
import {
  parseEther,
  formatEther,
  parseUnits,
  formatUnits,
} from "ethers/lib/utils";
import { IToken } from "../../models/Interfaces";
import { nullToken } from "../../data/gasTokens";
import { BigNumber } from "ethers";
import Big from "big.js";

export default function use1inchRetrieveQuote(
  currentChain: number,
  sellCrypto: IToken,
  buyCrypto: IToken,
  tradeAmount: string,
  tradeFreq: number,
  startDate: Date | null,
  endDate: Date | null,
  numExec: number
) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const formattedTradeAmount = parseUnits(tradeAmount, sellCrypto.decimals); //based off decimals of sell token

  if (currentChain === 31337) {
    //help with local testing
    currentChain = 1;
  }

  const readyUrl = `https://api.1inch.io/v4.0/${currentChain}/quote?fromTokenAddress=${sellCrypto.address}&toTokenAddress=${buyCrypto.address}&amount=${formattedTradeAmount}`;

  const { data, error } = useSWR(
    sellCrypto !== nullToken &&
      buyCrypto !== nullToken &&
      tradeAmount !== "0" &&
      tradeFreq > 0 &&
      startDate !== null &&
      endDate !== null &&
      numExec !== 0
      ? readyUrl
      : null,
    fetcher
  );

  if (data) {
    console.log("1inch fetch quote success", data);
    if (data?.estimatedGas) {
      let calcGas = data.estimatedGas * numExec * 2; //big number
      data.estimatedGasDcaGwei = BigNumber.from(calcGas);
      data.estimatedGasDcaFormatted = formatUnits(
        data.estimatedGasDcaGwei.toString(),
        "gwei"
      );
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
  }

  if (error) console.log("1inch fetch quote error", error);

  return {
    quote: data,
    isLoading: !error && !data,
    isError: error,
  };
}
