import { useEffect, useState, useContext } from "react";

import { createStyles } from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useWaitForTransaction,
} from "wagmi";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";

import { IToken } from "../../models/Interfaces";

import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositEthFundsFlow(
  token: IToken | null,
  defaultValue: string
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { classes } = useStyles();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const {
    config: prepareDepositEthSetup,
    error: prepareDepositEthSetupError,
    isError: prepareDepositEthSetupIsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "depositFunds",
    enabled:
      token?.address.toLowerCase() ===
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ? true
        : false,
    args: [
      token?.address,
      parseEther(defaultValue !== "" ? defaultValue : "0"),
    ],
    overrides: {
      from: address,
      value: parseEther(defaultValue !== "" ? defaultValue : "0"),
    },
    onError(error) {
      console.log("Deposit ETH Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Deposit ETH Prepared Success", data);
    },
  });

  const {
    data,
    error,
    isError: depositEthIsError,
    write: depositEth,
  } = useContractWrite({
    ...prepareDepositEthSetup,
    onSuccess(data) {
      console.log("Deposit ETH Write Success", data);

      showNotification({
        id: "deposit-eth-pending",
        loading: true,
        title: "Pending ETH Deposit",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: true,
        disallowClose: false,
      });
    },

    onError(error) {
      console.log("Deposit ETH Write Error", error);

      showNotification({
        id: "deposit-eth-error",
        color: "red",
        title: "Error ETH Deposit",
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
      console.log("Deposit ETH Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Deposit ETH",
      });

      updateNotification({
        id: "deposit-eth-pending",
        color: "teal",
        title: "ETH Deposit Received",
        message: "Happy DCAing :)",
        icon: <CircleCheck />,
      });
    },
    onError(error) {
      console.log("Deposit ETH Error", error);

      updateNotification({
        id: "deposit-eth-pending",
        color: "red",
        title: "Error ETH Deposit",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const {
    data: maxEthDeposit,
    isError,
    isLoading,
  } = useBalance({
    addressOrName: address,
    watch: true,
    onSuccess(data) {
      console.log("Get User Wallet ETH Balance Success", data);
    },
    onError(error) {
      console.log("Get User Wallet ETH Balance Error", error);
    },
  });

  return {
    approveMax: null,
    approve: null,
    deposit: depositEth,
    max: maxEthDeposit,
  };
}
