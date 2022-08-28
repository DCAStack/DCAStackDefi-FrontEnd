import { useContext } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useBalance,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ContractContext } from "../../App";

import { IToken } from "../../models/Interfaces";

import { parseEther } from "ethers/lib/utils";

export default function DepositEthFundsFlow(
  token: IToken | null,
  defaultValue: string
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const { config: prepareDepositEthSetup } = usePrepareContractWrite({
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

  const { data, write: depositEth } = useContractWrite({
    ...prepareDepositEthSetup,
    onSuccess(data) {
      console.log("Deposit ETH Write Success", data);

      showNotification({
        id: "deposit-eth-pending",
        loading: true,
        title: "Pending ETH Deposit",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: false,
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

  useWaitForTransaction({
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
        autoClose: true,
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

  const { data: maxEthDeposit } = useBalance({
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
