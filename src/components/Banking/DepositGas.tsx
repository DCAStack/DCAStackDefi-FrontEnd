import { useEffect, useState, useContext, ChangeEvent } from "react";

import {
  Group,
  TextInput,
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
  useWaitForTransaction,
} from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { BigNumber } from "ethers";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

interface ISetup {
  weiDefaultValue?: BigNumber;
}

export default function DepositGas({
  weiDefaultValue = BigNumber.from(0),
}: ISetup) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [depositAmount, setDeposit] = useState("0");
  const { classes } = useStyles();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const re = /^\d*\.?\d*$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      setDeposit(event.target.value);
    }
  };

  useEffect(() => {
    setDeposit(formatEther(weiDefaultValue.toString()));
  }, [weiDefaultValue]);

  const {
    config: depositGasSetup,
    error: depositGasError,
    isError: prepareDepositGasError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: depositAmount !== "" ? true : false,
    functionName: "depositGas",
    overrides: {
      from: address,
      value: depositAmount !== "" ? parseEther(depositAmount) : parseEther("0"),
    },
    onError(error) {
      console.log("Deposit Gas Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Deposit Gas Prepared Success", data);
    },
  });

  const {
    data,
    error,
    isError: depositError,
    write: depositGas,
  } = useContractWrite({
    ...depositGasSetup,
    onSuccess(data) {
      console.log("Deposit Gas Write Success", data);

      showNotification({
        id: "deposit-gas-pending",
        loading: true,
        title: "Pending Gas Deposit",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: true,
        disallowClose: false,
      });
    },

    onError(error) {
      console.log("Deposit Gas Write Error", error);

      showNotification({
        id: "deposit-gas-error",
        color: "red",
        title: "Error Gas Deposit",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const { isLoading: txPending, isSuccess: txDone } = useWaitForTransaction({
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
      });
    },
    onError(error) {
      console.log("Deposit Gas Error", error);

      updateNotification({
        id: "deposit-gas-pending",
        color: "red",
        title: "Error Gas Deposit",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const {
    data: maxDeposit,
    isError,
    isLoading,
  } = useBalance({
    addressOrName: address,
    watch: true,
    onSuccess(data) {
      console.log("Get User Wallet Gas Balance Success", data);
    },
    onError(error) {
      console.log("Get User Wallet Gas Balance Error", error);
    },
  });

  return (
    <Container my="deposit_gas">
      <Group align="end" position="center" spacing="xs">
        <TextInput
          styles={{
            input: {
              textAlign: "center",
            },
          }}
          value={depositAmount?.toString()}
          label="Deposit Gas Amount"
          radius="xs"
          size="xl"
          onChange={handleChange}
          icon={<GasToken />}
          iconWidth={115}
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xl"
              size="md"
              onClick={() =>
                maxDeposit
                  ? setDeposit(formatEther(maxDeposit?.value.toString()))
                  : setDeposit("0")
              }
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
          onClick={() => {
            if (maxDeposit?.formatted === "0.0") {
              showNotification({
                id: "deposit-balance-error",
                color: "red",
                title: "Insufficient Balance",
                message:
                  "If this was unexpected, please raise an issue on github!",
                autoClose: true,
                disallowClose: false,
                icon: <AlertOctagon />,
              });
            } else {
              depositGas?.();
            }
          }}
        >
          &nbsp;Deposit&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}
