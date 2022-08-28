import { useEffect, useState, useContext } from "react";

import { createStyles } from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
  erc20ABI,
} from "wagmi";
import { formatUnits } from "ethers/lib/utils";
import { ethers } from "ethers";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";

import { IToken } from "../../models/Interfaces";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositFundsFlow(
  token: IToken | null,
  defaultValue: string
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { classes } = useStyles();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const [enableApprovePrep, setApprovePrep] = useState(false);
  const [enableDepositPrep, setDepositPrep] = useState(false);
  const [depositAfterApprove, setDepositAfterApprove] = useState(false);
  const [maxDeposit, setMaxDeposit] = useState(BigNumber.from(0));

  const {
    data: maxTokenDeposit,
    isError: maxTokenDepositIsError,
    isLoading: maxTokenDepositIsLoading,
  } = useBalance({
    addressOrName: address,
    token: token?.address,
    watch: true,
    enabled:
      token?.address.toLowerCase() !==
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ? true
        : false,
    onSuccess(data) {
      console.log("Get User Wallet Token Balance Success", data);
      setMaxDeposit(data.value);
    },
    onError(error) {
      console.log("Get User Wallet Token Balance Error", error);
      setMaxDeposit(BigNumber.from(0));
    },
  });

  const {
    data: depositApproveSetup,
    isError: depositApproveError,
    isLoading: depositApproveLoading,
  } = useContractRead({
    addressOrName: token ? token.address : "",
    contractInterface: erc20ABI,
    functionName: "allowance",
    enabled:
      token?.address.toLowerCase() !==
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ? true
        : false,
    args: [address, contractAddr],
    cacheOnBlock: true,
    watch: true,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get User Fund Allowance Success", data);
    },
    onError(error) {
      console.log("Get User Fund Allowance Error", error);
    },
  });

  const {
    config: depositFundsSetup,
    error: depositFundsError,
    isError: prepareDepositFundsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "depositFunds",
    enabled: enableDepositPrep && !maxDeposit.eq(0),
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
      console.log("Deposit Prepare Funds Error", error);
    },
    onSuccess(data) {
      console.log("Deposit Prepare Funds Success", data);
    },
  });

  const {
    data: depositFundsWriteData,
    error: depositFundsWriteError,
    isError: depositFundsWriteIsError,
    write: depositFunds,
  } = useContractWrite({
    ...depositFundsSetup,
    onSuccess(data) {
      console.log("Deposit Funds Write Success", data);
      showNotification({
        id: "deposit-token-pending",
        loading: true,
        title: "Pending Token Deposit",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: false,
        disallowClose: false,
      });
      setDepositPrep(false);
      setDepositAfterApprove(false);
    },
    onError(error) {
      console.log("Deposit Funds Write Error", error);
      showNotification({
        id: "deposit-token-error",
        color: "red",
        title: "Error Token Deposit",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const { isLoading: depositTxPending, isSuccess: depositTxDone } =
    useWaitForTransaction({
      hash: depositFundsWriteData?.hash,
      onSuccess(data) {
        console.log("Deposit Funds Success", data);

        addRecentTransaction({
          hash: data.transactionHash,
          description: "Deposit Token",
        });

        updateNotification({
          id: "deposit-token-pending",
          color: "teal",
          title: "Token Deposit Received",
          message: "You're ready to create a schedule!",
          icon: <CircleCheck />,
          autoClose: true,
        });

        setDepositPrep(false);
      },

      onError(error) {
        console.log("Deposit Funds Error", error);

        updateNotification({
          id: "deposit-token-pending",
          color: "red",
          title: "Error Token Deposit",
          message: error.message,
          autoClose: true,
          disallowClose: false,
          icon: <AlertOctagon />,
        });
      },
    });

  const {
    config: prepareDepositApprove,
    error: prepareDepositApproveError,
    isError: prepareDepositApproveIsError,
  } = usePrepareContractWrite({
    addressOrName: token ? token.address : "",
    contractInterface: erc20ABI,
    functionName: "approve",
    enabled: enableApprovePrep,
    args: [contractAddr, ethers.constants.MaxUint256],
    overrides: {
      from: address,
    },
    onError(error) {
      console.log("Deposit Prepare Approve Error", error);
    },
    onSuccess(data) {
      console.log("Deposit Prepare Approve Success", data);
    },
  });

  const {
    data: depositApproveWriteData,
    error: depositApproveWriteError,
    isError: depositApproveWriteIsError,
    write: approveFunds,
  } = useContractWrite({
    ...prepareDepositApprove,
    onSuccess(data) {
      console.log("Deposit Approve Success", data);
      showNotification({
        id: "deposit-approve-pending",
        loading: true,
        title: "Pending Deposit Spend Approval",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: false,
        disallowClose: false,
      });
    },
    onError(error) {
      console.log("Deposit Approve Error", error);
      showNotification({
        id: "deposit-approve-error",
        color: "red",
        title: "Error Deposit Spend Approval",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const { isLoading: approveTxPending, isSuccess: approveTxDone } =
    useWaitForTransaction({
      hash: depositApproveWriteData?.hash,
      onSuccess(data) {
        console.log("Approval Transaction Success", data);

        addRecentTransaction({
          hash: data.transactionHash,
          description: "Approve Token Spend",
        });

        updateNotification({
          id: "deposit-approve-pending",
          color: "teal",
          title: "Deposit Spend Approved",
          message: "Now you can deposit funds!",
          icon: <CircleCheck />,
          autoClose: true,
        });

        setDepositAfterApprove(true);
      },
      onError(error) {
        console.log("Approval Transaction Error", error);

        updateNotification({
          id: "deposit-approve-pending",
          color: "red",
          title: "Error Deposit Spend Approval",
          message: error.message,
          autoClose: true,
          disallowClose: false,
          icon: <AlertOctagon />,
        });

        setDepositPrep(false);
      },
    });

  useEffect(() => {
    //flow 1: approve then deposit
    if (depositApproveSetup) {
      if (formatUnits(depositApproveSetup, token?.decimals) === "0.0") {
        setApprovePrep(true);
        setDepositPrep(false);
      }
      //flow 2: just deposit
      else {
        setApprovePrep(false);
        setDepositPrep(true);
      }
    }

    // to trigger after allowance
    if (depositAfterApprove) {
      depositFunds?.();
      // setDepositPrep(false);
    }
  }, [
    token?.decimals,
    depositFunds,
    enableDepositPrep,
    depositApproveSetup,
    depositAfterApprove,
  ]);

  return {
    approveMax: depositApproveSetup,
    approve: approveFunds,
    deposit: depositFunds,
    max: maxTokenDeposit,
  };
}
