import useSWR from "swr";
import { useContext, useState } from "react";
import { parseEther, formatUnits, formatEther } from "ethers/lib/utils";
import { IToken } from "../../models/Interfaces";
import { nullToken } from "../../data/gasTokens";
import { BigNumber } from "ethers";
import Big from "big.js";
import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import { useFeeData } from "wagmi";
import { createQueryString } from "./RetrieveQuote";
import { apiEndpoint } from "./endPoints";
import { ContractContext } from "../../App";

function arrayFetcher(...urlArr: any[]) {
  const f = (u: RequestInfo | URL) => fetch(u).then((r) => r.json());
  return Promise.all(urlArr.map(f));
}

export default function use0xRetrieveMultipleQuotes(
  currentChain: number,
  sellCrypto: IToken[],
  buyCrypto: IToken[],
  tradeAmount: string[],
  numExec: number[],
  bufferMultiplier: number = 10
) {
  const [feeData, setFeeData] = useState(BigNumber.from(0));
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  useFeeData({
    watch: true,
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

  let urlArray = [];
  for (let i = 0; i < sellCrypto.length; i++) {
    if (
      sellCrypto[i] !== nullToken &&
      sellCrypto[i] !== undefined &&
      buyCrypto[i] !== nullToken &&
      buyCrypto[i] !== undefined &&
      sellCrypto[i] !== buyCrypto[i] &&
      tradeAmount[i] !== "0" &&
      numExec[i] !== 0
    ) {
      const qs = createQueryString({
        sellToken: sellCrypto[i].address,
        buyToken: buyCrypto[i].address,
        sellAmount: tradeAmount[i],
        slippagePercentage: 0.01,
        takerAdddress: contractAddr,
      });

      const readyUrl = `${apiEndpoint[currentChain]}swap/v1/quote?${qs}`;
      urlArray.push(readyUrl);
    } else {
      console.log(`schedule ${i} has invalid parameters!`);
    }
  }

  const { data, error } = useSWR(
    currentChain !== 0 ? urlArray : null,
    arrayFetcher
  );

  let totalEstimatedGas = BigNumber.from(0);

  if (data) {
    console.log("0x fetch multi quote success", data, feeData.toString());

    Object.keys(data).map((key) => {
      if (data[Number(key)]) {
        if (data[Number(key)]?.gas) {
          data[Number(key)].estimatedGasSingleTradeWei = BigNumber.from(
            data[Number(key)].gas
          ).mul(feeData);
          data[Number(key)].estimatedGasFormattedMin = formatEther(
            data[Number(key)].estimatedGasSingleTradeWei
          );

          //buffer used for single trade calcs
          data[Number(key)].estimatedGasFormatted = formatEther(
            data[Number(key)].estimatedGasSingleTradeWei
              .mul(bufferMultiplier)
              .toString()
          );

          data[Number(key)].estimatedGasSingleTrade =
            data[Number(key)].estimatedGasSingleTradeWei.mul(bufferMultiplier);

          totalEstimatedGas = totalEstimatedGas.add(
            data[Number(key)].estimatedGasSingleTrade
          );

          let calcGas = data[Number(key)].estimatedGasSingleTradeWei
            .mul(numExec[Number(key)])
            .mul(bufferMultiplier);

          data[Number(key)].estimatedGasDcaFormatted = formatEther(
            calcGas.toString()
          );
          data[Number(key)].estimatedGasDca = BigNumber.from(
            parseEther(data[Number(key)].estimatedGasDcaFormatted)
          );

          data[Number(key)].estimatedGasDcaFormattedSafe = formatEther(
            calcGas.mul(bufferMultiplier).toString()
          );
          data[Number(key)].estimatedGasDcaSafe = BigNumber.from(
            parseEther(data[Number(key)].estimatedGasDcaFormattedSafe)
          );

          let minGas = data[Number(key)].estimatedGasSingleTradeWei.mul(
            numExec[Number(key)]
          );

          data[Number(key)].minGasDcaFormatted = formatEther(minGas.toString());
          data[Number(key)].minGasDca = BigNumber.from(
            parseEther(data[Number(key)].minGasDcaFormatted)
          );
        }

        if (
          data[Number(key)]?.toTokenAmount &&
          data[Number(key)]?.fromTokenAmount
        ) {
          const bnToAmount = Big(
            formatUnits(
              data[Number(key)].toTokenAmount,
              data[Number(key)].toToken.decimals
            )
          );
          const bnFromAmount = Big(
            formatUnits(
              data[Number(key)].fromTokenAmount,
              data[Number(key)].fromToken.decimals
            )
          );

          data[Number(key)].swapQuote = bnToAmount.div(bnFromAmount).toString();
        }
      }
      return true;
    });
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
    totalEstimatedGas: formatEther(totalEstimatedGas),
    isLoading: !error && !data,
    isError: error,
  };
}
