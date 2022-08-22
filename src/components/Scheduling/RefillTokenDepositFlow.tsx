import { useContext, useState } from "react";

import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";

import { useContractRead } from "wagmi";
import { ContractContext } from "../../App";
import { formatUnits } from "ethers/lib/utils";
import { IToken } from "../../models/Interfaces";
import { BigNumber } from "@ethersproject/bignumber";
import DepositEthFundsFlow from "../Banking/DepositEthFundsFlow";
import DepositFundsFlow from "../Banking/DepositFundsFlow";

export default function RefillTokenDepositFlow(
  enableFunc: boolean = false,
  tradeAmount: BigNumber,
  tradeFrequency: BigNumber,
  startDate: BigNumber,
  endDate: BigNumber,
  sellToken: IToken
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);

  const [needToken, setNeedToken] = useState("0.0");

  let depositEthActions = DepositEthFundsFlow(sellToken, needToken);
  let depositTokenActions = DepositFundsFlow(sellToken, needToken);

  useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "calculateDeposit",
    args: [tradeAmount, tradeFrequency, startDate, endDate, sellToken.address],
    enabled: enableFunc,
    onSuccess(data) {
      console.log("Get Token Needed Deposit Success", data.toString());
      setNeedToken(formatUnits(data, sellToken?.decimals));
    },
    onError(error) {
      console.log("Get Token Needed Deposit Error", error);
      setNeedToken("0.0");
    },
  });

  function triggerRefill() {
    console.log("we hit this");
    if (
      sellToken?.address.toLowerCase() ===
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      if (depositEthActions?.max?.formatted === "0.0") {
        showNotification({
          id: "deposit-eth-error",
          color: "red",
          title: "Insufficient Balance",
          message: "If this was unexpected, please raise an issue on github!",
          autoClose: true,
          disallowClose: false,
          icon: <AlertOctagon />,
        });
      } else {
        console.log("depositEthActions");

        depositEthActions?.deposit?.();
      }
    } else {
      if (depositTokenActions?.approveMax) {
        if (depositTokenActions?.max?.formatted === "0.0") {
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
          console.log("depositTokenActions");

          formatUnits(depositTokenActions?.approveMax, sellToken?.decimals) ===
          "0.0"
            ? depositTokenActions?.approve?.()
            : depositTokenActions?.deposit?.();
        }
      }
    }
  }

  return {
    needAmount: needToken,
    refill: needToken !== "0.0" ? triggerRefill : null,
  };
}
