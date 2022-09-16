import { useContext } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ContractContext } from "../../App";
import { nullToken } from "../../data/gasTokens";
import { IToken } from "../../models/Interfaces";

export default function WithdrawFundsFlow(
  token: IToken | null,
  defaultValue: string
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const { data: maxWithdraw } = useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "userTokenBalances",
    enabled:
      token !== null && token !== nullToken && token !== undefined
        ? true
        : false,
    args: [address, token?.address],
    cacheOnBlock: true,
    watch: true,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get Max Withdraw Success", data);
    },
    onError(error) {
      console.error("Get Max Withdraw Error", error);
    },
  });

  const { config: withdrawFundsSetup } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled:
      defaultValue !== "0" &&
      defaultValue !== "0.0" &&
      !defaultValue.includes("-") &&
      defaultValue !== "" &&
      token !== null &&
      token !== nullToken &&
      token !== undefined &&
      maxWithdraw?.toString() !== "0" &&
      maxWithdraw?.toString() !== "0.0"
        ? true
        : false,
    functionName: "withdrawFunds",
    args: [
      token?.address,
      token?.decimals !== 0
        ? parseUnits(defaultValue !== "" ? defaultValue : "0", token?.decimals)
        : BigNumber.from(0),
    ],
    overrides: {
      from: address,
    },
    onError(error) {
      console.error("Withdraw Funds Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Withdraw Funds Prepared Success", data);
    },
  });

  const { data, write: withdrawFunds } = useContractWrite({
    ...withdrawFundsSetup,
    onSuccess(data) {
      console.log("Withdraw Funds Write Success", data);

      showNotification({
        id: "withdraw-token-pending",
        loading: true,
        title: "Pending Token Withdrawal",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: false,
        disallowClose: false,
      });
    },

    onError(error) {
      console.error("Withdraw Funds Write Error", error);

      showNotification({
        id: "withdraw-token-error",
        color: "red",
        title: "Error token Withdrawal",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  useWaitForTransaction({
    hash: data?.hash,
    onSuccess(data) {
      console.log("Withdraw Funds Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Withdraw token",
      });

      updateNotification({
        id: "withdraw-token-pending",
        color: "teal",
        title: "Token Withdrawal Complete",
        message: "Safe travels :)",
        icon: <CircleCheck />,
        autoClose: true,
      });
    },
    onError(error) {
      console.error("Withdraw Gas Error", error);

      updateNotification({
        id: "withdraw-token-pending",
        color: "red",
        title: "Error Token Withdrawal",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  return {
    action:
      defaultValue !== "0" &&
      defaultValue !== "0.0" &&
      !defaultValue.includes("-") &&
      defaultValue !== "" &&
      token !== null &&
      token !== nullToken &&
      token !== undefined &&
      maxWithdraw?.toString() !== "0" &&
      maxWithdraw?.toString() !== "0.0"
        ? withdrawFunds
        : null,
    max: maxWithdraw ? formatUnits(maxWithdraw, token?.decimals) : "0.0",
  };
}
