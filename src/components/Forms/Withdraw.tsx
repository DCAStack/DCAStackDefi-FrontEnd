import { useEffect, useState } from "react";

import {
  Group,
  NumberInput,
  Grid,
  Container,
  Button,
  createStyles,
  Avatar,
} from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";
import GasToken from "../Forms/GasToken";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
} from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
import { ContractInfoProps } from "./../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function WithdrawFunds(
  { contract }: ContractInfoProps,
) {
  const [withdrawAmount, setWithdraw] = useState(0);
  const { classes } = useStyles();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const {
    config: withdrawGasSetup,
    error: withdrawGasError,
    isError: prepareWithdrawGasError,
  } = usePrepareContractWrite({
    addressOrName: contract.address,
    contractInterface: contract.abi,
    functionName: "withdrawGas",
    args: parseEther(String(withdrawAmount)),
    overrides: {
      from: address,
    },
    onError(error) {
      console.log("Withdraw Funds Error", error);
    },
    onSuccess(data) {
      console.log("Withdraw Funds Prepared", data);
    },
  });

  const {
    data,
    error,
    isError: withdrawError,
    write: withdrawGas,
  } = useContractWrite(withdrawGasSetup);

  const { isLoading: txPending, isSuccess: txDone } = useWaitForTransaction({
    hash: data?.hash,
  });

  if (withdrawError || prepareWithdrawGasError) {
    showNotification({
      id: "withdraw-gas-error",
      color: "red",
      title: "Error Gas Withdrawal",
      message: "If this was unexpected, please raise an issue on github!",
      autoClose: true,
      disallowClose: false,
      icon: <AlertOctagon />,
    });
  }

  if (txPending) {
    showNotification({
      id: "withdraw-gas-pending",
      loading: true,
      title: "Pending Gas Withdrawal",
      message: "Waiting for your tx. Check status on your account tab.",
      autoClose: true,
      disallowClose: false,
    });
  }

  if (txDone && data?.hash) {
    addRecentTransaction({
      hash: data?.hash,
      description: "Withdraw Gas",
    });

    updateNotification({
      id: "withdraw-gas-pending",
      color: "teal",
      title: "Gas Withdrawal Complete",
      message: "Safe travels :)",
      icon: <CircleCheck />,
    });
  }

  const {
    data: maxWithdraw,
    isError,
    isLoading,
  } = useContractRead({
    addressOrName: contract.address,
    contractInterface: contract.abi,
    functionName: "userGasBalances(address)",
    args: address,
    onSuccess(data) {
      console.log("Get User Gas for withdraw Success", data);
    },
    onError(error) {
      console.log("Get User Gas for withdraw Error", error);
    },
  });

  return (
    <Container my="withdraw_funds">
      <Group align="end" position="center" spacing="xs">
        <GasToken />
        <NumberInput
          value={withdrawAmount}
          label="Withdraw Amount"
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) => (val ? setWithdraw(val) : setWithdraw(0))}
        />{" "}
        <Button
          className={classes.input}
          compact
          radius="xs"
          size="xl"
          onClick={() =>
            maxWithdraw
              ? setWithdraw(Number(formatEther(maxWithdraw?.toString())))
              : setWithdraw(0)
          }
        >
          MAX
        </Button>{" "}
        <Button
          compact
          className={classes.input}
          radius="xs"
          size="xl"
          onClick={() => withdrawGas?.()}
        >
          Withdraw
        </Button>{" "}
      </Group>
    </Container>
  );
}
