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
import ViewToken from "../TokenDisplay/ViewToken";

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
import swapTokens from "../../data/swapTokens";
import { TokenBadgeProps } from "../../models/PropTypes";

import { parseUnits } from "ethers/lib/utils";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositFunds({
  token,
  defaultValue = 0,
}: TokenBadgeProps) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [depositAmount, setDeposit] = useState(0);
  const { classes } = useStyles();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  useEffect(() => {
    setDeposit(defaultValue);
  }, [defaultValue]);

  const {
    config: depositFundsSetup,
    error: depositFundsError,
    isError: prepareDepositFundsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "depositFunds",
    args: [token.address, parseUnits(String(depositAmount), token.decimals)],
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
    write: depositFunds,
  } = useContractWrite(depositFundsSetup);

  const { isLoading: txPending, isSuccess: txDone } = useWaitForTransaction({
    hash: data?.hash,
  });

  if (depositError) {
    showNotification({
      id: "deposit-funds-error",
      color: "red",
      title: "Error Fund Deposit",
      message: "If this was unexpected, please raise an issue on github!",
      autoClose: true,
      disallowClose: false,
      icon: <AlertOctagon />,
    });
  }

  if (txPending) {
    showNotification({
      id: "deposit-fund-pending",
      loading: true,
      title: "Pending Fund Deposit",
      message: "Waiting for your tx. Check status on your account tab.",
      autoClose: true,
      disallowClose: false,
    });
  }

  if (txDone && data?.hash) {
    addRecentTransaction({
      hash: data?.hash,
      description: "Deposit Fund",
    });

    updateNotification({
      id: "deposit-fund-pending",
      color: "teal",
      title: "Fund Deposit Received",
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
    <Container my="deposit_funds">
      <Group align="end" position="center" spacing="xs">
        <NumberInput
          value={depositAmount}
          label="Deposit DCA Amount"
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) => (val ? setDeposit(val) : setDeposit(0))}
          icon={<ViewToken token={token} />}
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
                  ? setDeposit(Number(maxDeposit?.formatted.split(".")[0]))
                  : setDeposit(0)
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
          onClick={() => depositFunds?.()}
        >
          &nbsp;Deposit&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}
