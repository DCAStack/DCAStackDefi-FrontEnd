import { ChangeEvent, useContext, useState } from "react";

import {
  Button,
  Container,
  createStyles,
  Group,
  TextInput,
} from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";
import GasToken from "../TokenDisplay/GasToken";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { formatEther, parseEther } from "ethers/lib/utils";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ContractContext } from "../../App";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function WithdrawGas() {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [withdrawAmount, setWithdraw] = useState("0");
  const { classes } = useStyles();
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const re = /^\d*\.?\d*$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      setWithdraw(event.target.value);
    }
  };

  const { config: withdrawGasSetup } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: withdrawAmount !== "" ? true : false,
    functionName: "withdrawGas",
    args: withdrawAmount !== "" ? parseEther(withdrawAmount) : parseEther("0"),
    overrides: {
      from: address,
    },
    onError(error) {
      console.log("Withdraw Gas Prepared Error", error);
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
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: false,
        disallowClose: false,
      });
    },

    onError(error) {
      console.log("Withdraw Gas Write Error", error);

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
      console.log("Withdraw Gas Error", error);

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

  const { data: maxWithdraw } = useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "userGasBalances",
    args: address,
    cacheOnBlock: true,
    watch: true,
    enabled: address !== undefined,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get User Gas for max withdraw Success", data);
    },
    onError(error) {
      console.log("Get User Gas for max withdraw Error", error);
    },
  });

  return (
    <Container my="withdraw_gas">
      <Group align="end" position="center" spacing="xs">
        <TextInput
          styles={{
            input: {
              textAlign: "center",
            },
          }}
          label="Withdraw Gas Amount"
          value={withdrawAmount?.toString()}
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
              radius="xs"
              size="md"
              onClick={() =>
                maxWithdraw
                  ? setWithdraw(formatEther(maxWithdraw?.toString()))
                  : setWithdraw("0")
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
          onClick={() => withdrawGas?.()}
        >
          Withdraw
        </Button>{" "}
      </Group>
    </Container>
  );
}
