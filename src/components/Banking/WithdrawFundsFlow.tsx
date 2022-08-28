import { useEffect, useState, useContext } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractRead,
  useWaitForTransaction,
} from "wagmi";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { BigNumber } from "ethers";
import { IToken } from "../../models/Interfaces";
import { nullToken } from "../../data/gasTokens";
import { parseUnits } from "ethers/lib/utils";

export default function WithdrawFundsFlow(
  token: IToken | null,
  defaultValue: string
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const {
    config: withdrawFundsSetup,
    error: prepareWithdrawFundsError,
    isError: prepareWithdrawFundsIsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled:
      defaultValue !== "0" &&
      defaultValue !== "" &&
      token !== null &&
      token !== nullToken &&
      token !== undefined
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
      console.log("Withdraw Gas Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Withdraw Gas Prepared Success", data);
    },
  });

  const {
    data,
    error,
    isError: withdrawFundsError,
    write: withdrawFunds,
  } = useContractWrite({
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
      console.log("Withdraw Funds Write Error", error);

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

  const { isLoading: txPending, isSuccess: txDone } = useWaitForTransaction({
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
      console.log("Withdraw Gas Error", error);

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

  const {
    data: maxWithdraw,
    isError: maxWithdrawIsError,
    isLoading: maxWithdrawIsLoading,
  } = useContractRead({
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
      console.log("Get Max Withdraw Error", error);
    },
  });

  return {
    action: withdrawFunds,
    max: maxWithdraw,
  };
}
