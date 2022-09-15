import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";

import { formatUnits } from "ethers/lib/utils";
import { IToken } from "../../models/Interfaces";
import DepositEthFundsFlow from "../Banking/DepositEthFundsFlow";
import DepositFundsFlow from "../Banking/DepositFundsFlow";

export default function RefillTokenDepositFlow(
  sellToken: IToken,
  needToken: string
) {
  let depositEthActions = DepositEthFundsFlow(sellToken, needToken);
  let depositTokenActions = DepositFundsFlow(sellToken, needToken);

  console.log("checking", sellToken, needToken);

  function triggerRefill() {
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
        console.log("depositEthActions", depositEthActions);

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
