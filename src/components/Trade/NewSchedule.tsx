import React from "react";
import { useEffect, useState, useContext } from "react";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";

import {
  Group,
  NumberInput,
  Container,
  Button,
  createStyles,
  Space,
  NativeSelect,
  Text,
  Title,
  Stack,
} from "@mantine/core";
import { DateRangePicker, TimeInput } from "@mantine/dates";
import { BigNumber } from "ethers";

import { showNotification, updateNotification } from "@mantine/notifications";
import SwapToken from "./SwapToken";
import dayjs from "dayjs";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractReads,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import {
  parseEther,
  formatEther,
  parseUnits,
  formatUnits,
} from "ethers/lib/utils";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { ActionIcon } from "@mantine/core";
import { SwitchHorizontal, PlayerPlay } from "tabler-icons-react";

import DepositGas from "../Banking/DepositGas";
import DepositFunds from "../Banking/DepositFunds";

import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";

import { nullToken } from "../../data/gasTokens";
import { IToken } from "../../models/Interfaces";

interface IScheduleParams {
  sellToken: IToken;
  buyToken: IToken;
  sellAmount: BigNumber;
  tradeFreq: number;
  numExec: number;
  startDate: Date | null;
  endDate: Date | null;
  quoteDetails: Record<string, any>;
  freeTokenBal: BigNumber;
  freeGasBal: BigNumber;
  depositAmount: BigNumber;
}

export default function NewSchedule({
  sellToken,
  buyToken,
  sellAmount,
  tradeFreq,
  numExec,
  startDate,
  endDate,
  quoteDetails,
  freeTokenBal,
  freeGasBal,
  depositAmount: weiDepositAmount,
}: IScheduleParams) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const unixStartDate = startDate ? startDate?.getTime() / 1000 : 0;
  const unixEndDate = endDate ? endDate?.getTime() / 1000 : 0;

  const [enablePrep, setPrep] = useState(false);
  const [buttonTxt, setButtonTxt] = useState("Waiting...");

  const formatSellAmount = formatUnits(
    sellAmount.toString(),
    sellToken.decimals
  );

  useEffect(() => {
    if (
      sellToken !== nullToken &&
      buyToken !== nullToken &&
      !sellAmount.isZero() &&
      tradeFreq !== 0 &&
      numExec !== 0 &&
      unixStartDate &&
      unixEndDate &&
      !freeTokenBal.isZero() &&
      !freeGasBal.isZero()
    ) {
      setPrep(true);
      setButtonTxt("Start DCA");
    } else {
      setPrep(false);
      setButtonTxt("Not Ready!");
    }
  }, [
    sellToken,
    buyToken,
    tradeFreq,
    sellAmount,
    numExec,
    unixStartDate,
    unixEndDate,
    freeTokenBal,
    freeGasBal,
  ]);

  const {
    config: prepareNewScheduleSetup,
    error: prepareNewScheduleError,
    isError: prepareNewScheduleIsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "createDcaSchedule",
    enabled: enablePrep,
    args: [
      tradeFreq,
      sellAmount,
      buyToken.address,
      sellToken.address,
      unixStartDate,
      unixEndDate,
    ],
    onError(error) {
      console.log("New Schedule Prepared Error", error);
    },
    onSuccess(data) {
      console.log("New Schedule Prepared Success", data);
    },
  });

  const {
    data,
    error,
    isError: newScheduleError,
    write: newSchedule,
  } = useContractWrite({
    ...prepareNewScheduleSetup,
    onSuccess(data) {
      console.log("New Schedule Write Success", data);

      showNotification({
        id: "new-schedule-pending",
        loading: true,
        title: "Pending Schedule Creation",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: true,
        disallowClose: false,
      });
    },

    onError(error) {
      console.log("New Schedule Write Error", error);

      showNotification({
        id: "new-schedule-error",
        color: "red",
        title: "Error Creating Schedule",
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
      console.log("New Schedule Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Create Schedule",
      });

      updateNotification({
        id: "new-schedule-pending",
        color: "teal",
        title: "Schedule Created",
        message: "Happy DCAing :)",
        icon: <CircleCheck />,
      });
    },
    onError(error) {
      console.log("New Schedule Error", error);

      updateNotification({
        id: "new-schedule-pending",
        color: "red",
        title: "Error Creating Schedule",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

  return (
    <div>
      <Group align="end" position="left">
        <Stack align="left">
          <Title order={2}>Your Schedule Details</Title>

          <Group align="end" position="left" spacing="xs">
            <Text size="lg">You're selling</Text>
            <Text weight={700} color="green">
              {formatSellAmount} {sellToken.symbol}
            </Text>
            <Text size="lg">to buy</Text>
            <Text weight={700} color="green">
              {buyToken.symbol}
            </Text>
            <Text size="lg">Every</Text>
            <Text weight={700} color="green">
              {tradeFreq} Days
            </Text>
          </Group>

          <Group align="end" position="left" spacing="xs">
            <Text size="lg">Your schedule will run</Text>
            <Text weight={700} color="green">
              {numExec} times
            </Text>
            <Text size="lg">from</Text>
            <Text weight={700} color="green">
              {startDate?.toDateString()}
            </Text>
            <Text size="lg">to</Text>
            <Text weight={700} color="green">
              {endDate?.toDateString()}
            </Text>
          </Group>

          <Group align="end" position="left" spacing="xs">
            <Text size="lg">Total deposit required is</Text>
            <Text weight={700} color="green">
              {formatUnits(weiDepositAmount.toString(), sellToken.decimals)}{" "}
              {sellToken.symbol}
            </Text>
            <Text size="lg">because you're swapping</Text>
            <Text weight={700} color="green">
              {formatSellAmount} {sellToken.symbol}
            </Text>
            <Text size="lg">x</Text>
            <Text weight={700} color="green">
              {numExec} times
            </Text>
          </Group>

          {!freeTokenBal.eq(0) && //run if additional deposit needed
            weiDepositAmount.gt(freeTokenBal) && (
              <Group align="end" position="left" spacing="xs">
                <Text size="lg">But you have</Text>
                <Text weight={700} color="green">
                  {formatUnits(freeTokenBal, sellToken.decimals)}{" "}
                  {sellToken.symbol}
                </Text>
                <Text size="lg">not in use so your deposit is just</Text>
                <Text weight={700} color="green">
                  {formatUnits(
                    weiDepositAmount.sub(freeTokenBal),
                    sellToken.decimals
                  )}{" "}
                  {sellToken.symbol}
                </Text>
              </Group>
            )}

          {!freeTokenBal.eq(0) && //run if zero needed
            weiDepositAmount.lte(freeTokenBal) && (
              <Group align="end" position="left" spacing="xs">
                <Text size="lg">But you have</Text>
                <Text weight={700} color="green">
                  {formatUnits(freeTokenBal, sellToken.decimals)}{" "}
                  {sellToken.symbol}
                </Text>
                <Text size="lg">not in use, so a deposit is not needed!</Text>
              </Group>
            )}

          <Space h="md" />

          <Title order={2}>Your Swap Quote</Title>

          <Group align="end" position="left" spacing="xs">
            <Text size="lg">Current swap quote is:</Text>
            <Text weight={700} color="green">
              1 {sellToken.symbol} for ~{quoteDetails?.swapQuote}{" "}
              {buyToken.symbol}
            </Text>
          </Group>

          <Group align="end" position="left" spacing="xs">
            <Text size="lg">Estimated gas per swap is:</Text>
            <Text weight={700} color="green">
              {quoteDetails?.estimatedGasFormatted} {networkCurrency}
            </Text>
          </Group>

          <Group align="end" position="left" spacing="xs">
            <Text size="lg">Your total gas deposit is</Text>
            <Text weight={700} color="green">
              {quoteDetails?.estimatedGasDcaFormatted} {networkCurrency}
            </Text>
            <Text size="lg">because you're swapping</Text>
            <Text weight={700} color="green">
              {numExec} times
            </Text>
            <Text size="xs">(x 2 for a buffer)</Text>
          </Group>

          {!freeGasBal.eq(0) && //run if additional deposit needed
            quoteDetails?.estimatedGasDca.gt(freeGasBal) && (
              <Group align="end" position="left" spacing="xs">
                <Text size="lg">But you have</Text>
                <Text weight={700} color="green">
                  {formatEther(freeGasBal)} {networkCurrency}
                </Text>
                <Text size="lg">not in use so your deposit is just</Text>
                <Text weight={700} color="green">
                  {formatEther(quoteDetails?.estimatedGasDca.sub(freeGasBal))}{" "}
                  {networkCurrency}
                </Text>
              </Group>
            )}

          {!freeGasBal.eq(0) && //run if zero needed
            quoteDetails?.estimatedGasDca.lte(freeGasBal) && (
              <Group align="end" position="left" spacing="xs">
                <Text size="lg">But you have</Text>
                <Text weight={700} color="green">
                  {formatEther(freeGasBal)} {networkCurrency}
                </Text>
                <Text size="lg">
                  not in use, so a gas deposit is not needed!
                </Text>
              </Group>
            )}

          <Group align="end" position="left" spacing="xs">
            <Text size="lg">Default slippage is:</Text>
            <Text weight={700} color="green">
              1%
            </Text>
          </Group>
        </Stack>
      </Group>
      <Space h="xl" />
      <Group align="end" position="center" spacing="xs" grow>
        <Button
          fullWidth
          radius="xl"
          size="xl"
          variant="gradient"
          gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
          onClick={() => newSchedule?.()}
        >
          {buttonTxt}
        </Button>
      </Group>
    </div>
  );
}
