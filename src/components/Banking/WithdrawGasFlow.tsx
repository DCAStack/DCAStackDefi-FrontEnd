import { useContext } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { parseEther } from "ethers/lib/utils";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ContractContext } from "../../App";

export default function WithdrawGasFlow(
  defaultValue: string,
  enableWithdraw: boolean = false
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const { config: withdrawGasSetup } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: defaultValue !== "" && enableWithdraw ? true : false,
    functionName: "withdrawGas",
    args:
      defaultValue !== "" && defaultValue !== "0" && defaultValue !== "0.0"
        ? parseEther(defaultValue)
        : parseEther("0"),
    overrides: {
      from: address,
    },
    onError(error) {
      console.error("Withdraw Gas Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Withdraw Gas Prepared Success", data);
    },
  });

  const { data, write: withdrawGas } = useContractWrite({
    ...withdrawGasSetup,
    onSuccess(data) {
      console.log("Withdraw Gas Write Success", data);

      showNotification({
        id: "withdraw-gas-pending",
        loading: true,
        title: "Pending Gas Withdrawal",
        message: "Waiting for your tx...",
        autoClose: false,
        disallowClose: false,
      });
    },

    onError(error) {
      console.error("Withdraw Gas Write Error", error);

      showNotification({
        id: "withdraw-gas-error",
        color: "red",
        title: "Error Gas Withdrawal",
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
      console.log("Withdraw Gas Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Withdraw Gas",
      });

      updateNotification({
        id: "withdraw-gas-pending",
        color: "teal",
        title: "Gas Withdrawal Complete",
        message: "Safe travels :)",
        icon: <CircleCheck />,
        autoClose: true,
      });
    },
    onError(error) {
      console.error("Withdraw Gas Error", error);

      updateNotification({
        id: "withdraw-gas-pending",
        color: "red",
        title: "Error Gas Withdrawal",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  return {
    withdraw:
      defaultValue !== "" && defaultValue !== "0" && defaultValue !== "0.0"
        ? withdrawGas
        : null,
  };
}
