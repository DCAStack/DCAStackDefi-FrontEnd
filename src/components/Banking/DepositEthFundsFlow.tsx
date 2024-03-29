import { useContext } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useBalance,
  useContractWrite,
  useNetwork,
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
  const { chain } = useNetwork();

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

  const { config: prepareDepositEthSetup } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "depositFunds",
    enabled:
      token?.address.toLowerCase() ===
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" &&
      defaultValue !== "0" &&
      defaultValue !== "0.0"
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
      console.error("Deposit ETH Prepared Error", error);
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
        title: `Pending ${networkCurrency} Deposit`,
        message: "Waiting for your tx...",
        autoClose: false,
        disallowClose: false,
      });
    },

    onError(error) {
      console.error("Deposit ETH Write Error", error);

      showNotification({
        id: "deposit-eth-error",
        color: "red",
        title: `Error ${networkCurrency} Deposit`,
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
        description: `Deposit ${networkCurrency}`,
      });

      updateNotification({
        id: "deposit-eth-pending",
        color: "teal",
        title: `${networkCurrency} Deposit Received`,
        message: "Happy DCAing :)",
        icon: <CircleCheck />,
        autoClose: true,
      });
    },
    onError(error) {
      console.error("Deposit ETH Error", error);

      updateNotification({
        id: "deposit-eth-pending",
        color: "red",
        title: `Error ${networkCurrency} Deposit`,
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
      console.error("Get User Wallet ETH Balance Error", error);
    },
  });

  return {
    approveMax: null,
    approve: null,
    deposit:
      token?.address.toLowerCase() ===
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" &&
      defaultValue !== "0" &&
      defaultValue !== "0.0"
        ? depositEth
        : null,
    max: maxEthDeposit,
  };
}
