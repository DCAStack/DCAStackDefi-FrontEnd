import { useEffect, useState, useContext } from "react";

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
import GasToken from "../TokenDisplay/GasToken";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
import { ContractInfoProps } from "./../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { BigNumber } from "ethers";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function WithdrawGas() {
  const { chain, chains } = useNetwork();

  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [weiWithdrawAmount, setWithdraw] = useState(BigNumber.from(0));
  const { classes } = useStyles();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const {
    config: withdrawGasSetup,
    error: withdrawGasError,
    isError: prepareWithdrawGasError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "withdrawGas",
    args: weiWithdrawAmount,
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

  const {
    data,
    error,
    isError: withdrawError,
    write: withdrawGas,
  } = useContractWrite({
    ...withdrawGasSetup,
    onSuccess(data) {
      console.log("Withdraw Gas Write Success", data);

      showNotification({
        id: "withdraw-gas-pending",
        loading: true,
        title: "Pending Gas Withdrawal",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: true,
        disallowClose: false,
      });
    },

    onError(error) {
      console.log("Withdraw Gas Write Error", error);

      showNotification({
        id: "withdraw-gas-error",
        color: "red",
        title: "Error Gas Withdrawal",
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
      });
    },
    onError(error) {
      console.log("Withdraw Gas Error", error);

      updateNotification({
        id: "withdraw-gas-pending",
        color: "red",
        title: "Error Gas Withdrawal",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const {
    data: maxWithdraw,
    isError,
    isLoading,
  } = useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "userGasBalances",
    args: address,
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get User Gas for withdraw Success", data);
      console.log(typeof data, data.toString());
    },
    onError(error) {
      console.log("Get User Gas for withdraw Error", error);
    },
  });

  return (
    <Container my="withdraw_gas">
      <Group align="end" position="center" spacing="xs">
        <NumberInput
          precision={chain?.nativeCurrency?.decimals}
          label="Withdraw Gas Amount"
          value={Number(formatEther(weiWithdrawAmount.toString()))}
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) =>
            val
              ? setWithdraw(parseEther(String(val)))
              : setWithdraw(BigNumber.from(0))
          }
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
                  ? setWithdraw(BigNumber.from(maxWithdraw))
                  : setWithdraw(BigNumber.from(0))
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
