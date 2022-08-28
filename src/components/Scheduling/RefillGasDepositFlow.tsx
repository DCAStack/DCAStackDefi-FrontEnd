import { useEffect, useContext, useState } from "react";

import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";

import { useNetwork, useContractRead, useAccount } from "wagmi";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { parseEther, formatEther } from "ethers/lib/utils";
import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";
import { IToken } from "../../models/Interfaces";
import { BigNumber } from "@ethersproject/bignumber";
import DepositGasFlow from "../Banking/DepositGasFlow";

export default function RefillGasDepositFlow(
  enableFunc: boolean = false,
  tradeAmount: BigNumber,
  tradeFrequency: BigNumber,
  startDate: BigNumber,
  endDate: BigNumber,
  sellToken: IToken,
  buyToken: IToken,
  numExec: number
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const addRecentTransaction = useAddRecentTransaction();
  const { chain, chains } = useNetwork();
  const currentChain: number = chain ? chain?.id : 0;
  const { address, isConnecting, isDisconnected } = useAccount();

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

  const [quote1inch, setQuote1inch] = useState({
    estimatedGasFormatted: "0",
  });
  const [enableRead, setEnableRead] = useState(false);
  const [needGas, setNeedGas] = useState("0.0");

  let depositGasActions = DepositGasFlow(needGas);

  const {
    quote: quoteDetails,
    isLoading: quoteLoading,
    isError: quoteError,
  } = use1inchRetrieveQuote(
    currentChain,
    sellToken,
    buyToken,
    tradeAmount.toString(),
    tradeFrequency.toNumber(),
    new Date(),
    new Date(),
    numExec,
    true
  );

  useEffect(() => {
    if (quoteDetails) {
      setQuote1inch(quoteDetails);
      setEnableRead(true);
    }
  }, [quoteDetails]);

  useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "calculateGasDeposit",
    args: [
      parseEther(quote1inch?.estimatedGasFormatted), //gas for single trade
      tradeFrequency,
      startDate,
      endDate,
    ],
    enabled: enableFunc && enableRead,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get Gas Needed Deposit Success", data.toString());
      setNeedGas(formatEther(data));
    },
    onError(error) {
      console.log("Get Gas Needed Deposit Error", error);
      setNeedGas("0.0");
    },
  });

  function triggerRefill() {
    if (depositGasActions?.max?.formatted === "0.0") {
      showNotification({
        id: "deposit-balance-error",
        color: "red",
        title: "Insufficient Balance",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    } else {
      depositGasActions?.deposit?.();
    }
  }

  return {
    needAmount: needGas,
    refill: needGas !== "0.0" ? triggerRefill : null,
  };
}
