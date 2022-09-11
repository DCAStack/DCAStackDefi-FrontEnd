import { useContext } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { parseEther } from "ethers/lib/utils";
import {
  useAccount,
  useBalance,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ContractContext } from "../../App";

export default function DepositGasFlow(defaultValue: string) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const { config: depositGasSetup } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: defaultValue !== "" ? true : false,
    functionName: "depositGas",
    overrides: {
      from: address,
      value: defaultValue !== "" ? parseEther(defaultValue) : parseEther("0"),
    },
    onError(error) {
      console.error("Deposit Gas Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Deposit Gas Prepared Success", data);
    },
  });

  const { data, write: depositGas } = useContractWrite({
    ...depositGasSetup,
    onSuccess(data) {
      console.log("Deposit Gas Write Success", data);

      showNotification({
        id: "deposit-gas-pending",
        loading: true,
        title: "Pending Gas Deposit",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: false,
        disallowClose: false,
      });
    },

    onError(error) {
      console.error("Deposit Gas Write Error", error);

      showNotification({
        id: "deposit-gas-error",
        color: "red",
        title: "Error Gas Deposit",
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
      console.log("Deposit Gas Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Deposit Gas",
      });

      updateNotification({
        id: "deposit-gas-pending",
        color: "teal",
        title: "Gas Deposit Received",
        message: "Happy DCAing :)",
        icon: <CircleCheck />,
        autoClose: true,
      });
    },
    onError(error) {
      console.error("Deposit Gas Error", error);

      updateNotification({
        id: "deposit-gas-pending",
        color: "red",
        title: "Error Gas Deposit",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const { data: maxDeposit } = useBalance({
    addressOrName: address,
    watch: true,
    onSuccess(data) {
      console.log("Get User Wallet Gas Balance Success", data);
    },
    onError(error) {
      console.error("Get User Wallet Gas Balance Error", error);
    },
  });

  return {
    deposit: depositGas,
    max: maxDeposit,
  };
}
