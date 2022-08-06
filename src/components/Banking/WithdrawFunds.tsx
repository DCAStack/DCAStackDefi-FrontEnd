import { useEffect, useState, useContext } from "react";

import {
  Group,
  NumberInput,
  Grid,
  Container,
  Button,
  createStyles,
  Avatar,
  Space,
} from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";
import GasToken from "../TokenDisplay/GasToken";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
} from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import swapTokens from "./../../data/swapTokens";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function WithdrawFunds() {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [depositAmount, setDeposit] = useState(0);
  const { classes } = useStyles();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const {
    config: depositGasSetup,
    error: depositGasError,
    isError: prepareDepositGasError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "depositGas",
    overrides: {
      from: address,
      value: parseEther(String(depositAmount)),
    },
    onError(error) {
      console.log("Deposit Funds Error", error);
    },
    onSuccess(data) {
      console.log("Deposit Funds Prepared", data);
    },
  });

  const {
    data,
    error,
    isError: depositError,
    write: depositGas,
  } = useContractWrite(depositGasSetup);

  const { isLoading: txPending, isSuccess: txDone } = useWaitForTransaction({
    hash: data?.hash,
  });

  if (depositError || prepareDepositGasError) {
    showNotification({
      id: "deposit-gas-error",
      color: "red",
      title: "Error Gas Deposit",
      message: "If this was unexpected, please raise an issue on github!",
      autoClose: true,
      disallowClose: false,
      icon: <AlertOctagon />,
    });
  }

  if (txPending) {
    showNotification({
      id: "deposit-gas-pending",
      loading: true,
      title: "Pending Gas Deposit",
      message: "Waiting for your tx. Check status on your account tab.",
      autoClose: true,
      disallowClose: false,
    });
  }

  if (txDone && data?.hash) {
    addRecentTransaction({
      hash: data?.hash,
      description: "Deposit Gas",
    });

    updateNotification({
      id: "deposit-gas-pending",
      color: "teal",
      title: "Gas Deposit Received",
      message: "Happy DCAing :)",
      icon: <CircleCheck />,
    });
  }

  const {
    data: maxDeposit,
    isError,
    isLoading,
  } = useBalance({
    addressOrName: address,
    watch: true,
    onSuccess(data) {
      console.log("Get User Wallet Balance Success", data);
    },
    onError(error) {
      console.log("Get User Wallet Balance Error", error);
    },
  });

  return (
    <Container my="withdraw_funds">
      <Group align="end" position="center" spacing="xs">
        <NumberInput
          disabled
          value={depositAmount}
          label="Withdraw Funds"
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) => (val ? setDeposit(val) : setDeposit(0))}
          icon={<GasToken />}
          iconWidth={115}
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xs"
              size="md"
            >
              MAX
            </Button>
          }
          rightSectionWidth={65}
        />
        <Button
          compact
          className={classes.input}
          radius="xs"
          size="xl"
          onClick={() => depositGas?.()}
        >
          &nbsp;Withdraw&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}
