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
  erc20ABI,
} from "wagmi";
import { parseEther, formatEther, formatUnits } from "ethers/lib/utils";
import { MaxUint256 } from "ethers/constants";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import swapTokens from "../../data/swapTokens";
import { TokenBadgeProps } from "../../models/PropTypes";

import { parseUnits } from "ethers/lib/utils";
import { nullToken } from "../../data/gasTokens";

import { BigNumber } from "ethers";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositEthFunds({
  token,
  weiDefaultValue = BigNumber.from(0),
}: TokenBadgeProps) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [weiDepositAmount, setDeposit] = useState(BigNumber.from(0));
  const { classes } = useStyles();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  console.log(
    "deposit amount is",
    weiDepositAmount,
    weiDepositAmount.toString()
  );

  useEffect(() => {
    setDeposit(weiDefaultValue);
  }, [weiDefaultValue]);

  const {
    config: prepareDepositEthSetup,
    error: prepareDepositEthSetupError,
    isError: prepareDepositEthSetupIsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "depositFunds",
    args: [token.address, weiDepositAmount],
    overrides: {
      from: address,
      value: weiDepositAmount,
    },
    onError(error) {
      console.log("Deposit ETH Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Deposit ETH Prepared Success", data);
    },
  });

  const {
    data,
    error,
    isError: depositEthIsError,
    write: depositEth,
  } = useContractWrite({
    ...prepareDepositEthSetup,
    onSuccess(data) {
      console.log("Deposit ETH Write Success", data);

      showNotification({
        id: "deposit-eth-pending",
        loading: true,
        title: "Pending ETH Deposit",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: true,
        disallowClose: false,
      });
    },

    onError(error) {
      console.log("Deposit ETH Write Error", error);

      showNotification({
        id: "deposit-eth-error",
        color: "red",
        title: "Error ETH Deposit",
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
      });
    },
    onError(error) {
      console.log("Deposit ETH Error", error);

      updateNotification({
        id: "deposit-eth-pending",
        color: "red",
        title: "Error ETH Deposit",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const {
    data: maxEthDeposit,
    isError,
    isLoading,
  } = useBalance({
    addressOrName: address,
    watch: true,
    onSuccess(data) {
      console.log("Get User Wallet ETH Balance Success", data);
    },
    onError(error) {
      console.log("Get User Wallet ETH Balance Error", error);
    },
  });

  return (
    <Container my="deposit_funds">
      <Group align="end" position="center" spacing="xs">
        <NumberInput
          style={{ textAlign: "center" }}
          precision={token?.decimals}
          value={Number(formatUnits(weiDepositAmount, token.decimals))}
          label="Deposit DCA Amount"
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) =>
            val
              ? setDeposit(parseEther(String(val)))
              : setDeposit(BigNumber.from(0))
          }
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
                maxEthDeposit
                  ? setDeposit(maxEthDeposit?.value)
                  : setDeposit(BigNumber.from(0))
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
            if (maxEthDeposit?.formatted === "0.0") {
              showNotification({
                id: "deposit-eth-error",
                color: "red",
                title: "Insufficient Balance",
                message:
                  "If this was unexpected, please raise an issue on github!",
                autoClose: true,
                disallowClose: false,
                icon: <AlertOctagon />,
              });
            } else {
              depositEth?.();
            }
          }}
        >
          &nbsp;Deposit&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}
