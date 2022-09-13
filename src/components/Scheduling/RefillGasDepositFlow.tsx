import { useContext, useEffect, useState } from "react";

import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";

import { BigNumber } from "@ethersproject/bignumber";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";
import { ContractContext } from "../../App";
import { IToken } from "../../models/Interfaces";
import DepositGasFlow from "../Banking/DepositGasFlow";

export default function RefillGasDepositFlow(
  scheduleStatus: boolean,
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
  const { chain } = useNetwork();
  const currentChain: number = chain ? chain?.id : 0;
  const { address } = useAccount();

  const [quote1inch, setQuote1inch] = useState({
    estimatedGasFormatted: "0",
  });
  const [enableRead, setEnableRead] = useState(false);
  const [needGas, setNeedGas] = useState("0.0");

  let depositGasActions = DepositGasFlow(needGas);

  const { quote: quoteDetails } = use1inchRetrieveQuote(
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
    enabled: enableRead,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get Gas Needed Deposit Success", data.toString());
      setNeedGas(formatEther(data));
    },
    onError(error) {
      console.error("Get Gas Needed Deposit Error", error);
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
