import { useContext, useEffect, useState } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";

import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import {
  erc20ABI,
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";

import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { IToken } from "../../models/Interfaces";

export default function DepositFundsFlow(
  token: IToken | null,
  defaultValue: string
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const [enableApprovePrep, setApprovePrep] = useState(false);
  const [enableDepositPrep, setDepositPrep] = useState(false);
  const [depositAfterApprove, setDepositAfterApprove] = useState(false);
  const [maxDeposit, setMaxDeposit] = useState(BigNumber.from(0));

  const { data: maxTokenDeposit } = useBalance({
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
      console.error("Get User Wallet Token Balance Error", error);
      setMaxDeposit(BigNumber.from(0));
    },
  });

  const { data: depositApproveSetup } = useContractRead({
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
      console.error("Get User Fund Allowance Error", error);
    },
  });

  const { config: depositFundsSetup } = usePrepareContractWrite({
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
      console.error("Deposit Prepare Funds Error", error);
    },
    onSuccess(data) {
      console.log("Deposit Prepare Funds Success", data);
    },
  });

  const { data: depositFundsWriteData, write: depositFunds } = useContractWrite(
    {
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
        console.error("Deposit Funds Write Error", error);
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
    }
  );

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
      console.error("Deposit Funds Error", error);

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

  const { config: prepareDepositApprove } = usePrepareContractWrite({
    addressOrName: token ? token.address : "",
    contractInterface: erc20ABI,
    functionName: "approve",
    enabled: enableApprovePrep,
    args: [contractAddr, ethers.constants.MaxUint256],
    overrides: {
      from: address,
    },
    onError(error) {
      console.error("Deposit Prepare Approve Error", error);
    },
    onSuccess(data) {
      console.log("Deposit Prepare Approve Success", data);
    },
  });

  const { data: depositApproveWriteData, write: approveFunds } =
    useContractWrite({
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
        console.error("Deposit Approve Error", error);
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
      console.error("Approval Transaction Error", error);

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
