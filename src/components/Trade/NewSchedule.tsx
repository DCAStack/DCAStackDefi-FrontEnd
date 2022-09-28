import { useContext, useEffect, useState } from "react";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";

import { Button, Group, Space, Stack, Text, Title } from "@mantine/core";
import { BigNumber } from "ethers";

import { showNotification, updateNotification } from "@mantine/notifications";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers/lib/utils";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ContractContext } from "../../App";

import { nullToken } from "../../data/gasTokens";
import { IToken } from "../../models/Interfaces";
import { useNavigate } from "react-router-dom";

interface IScheduleParams {
  sellToken: IToken;
  buyToken: IToken;
  sellAmount: string;
  tradeFreq: BigNumber;
  numExec: number;
  startDate: Date | null;
  endDate: Date | null;
  startTime: Date;
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
  startTime,
  quoteDetails,
  freeTokenBal,
  freeGasBal,
  depositAmount: weiDepositAmount,
}: IScheduleParams) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain } = useNetwork();
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();
  const nav = useNavigate();

  let startDateTime = null;
  let endDateTime = null;
  if (startDate && endDate) {
    startDateTime = new Date(
      startDate?.toDateString() + " " + startTime.toTimeString()
    );

    endDateTime = new Date(
      endDate?.toDateString() + " " + startTime.toTimeString()
    );
  }

  const unixStartDate = startDateTime ? startDateTime?.getTime() / 1000 : 0;
  const unixEndDate = endDateTime ? endDateTime?.getTime() / 1000 : 0;

  const [enablePrep, setPrep] = useState(false);
  const [buttonTxt, setButtonTxt] = useState("Waiting...");

  const weiSellAmount =
    sellToken?.decimals !== 0
      ? parseUnits(sellAmount !== "" ? sellAmount : "0", sellToken?.decimals)
      : BigNumber.from(0);

  useEffect(() => {
    if (
      sellToken !== nullToken &&
      buyToken !== nullToken &&
      weiSellAmount.gt(0) &&
      tradeFreq.gt(0) &&
      numExec !== 0 &&
      unixStartDate !== 0 &&
      unixEndDate !== 0 &&
      freeTokenBal.gte(weiDepositAmount) &&
      freeGasBal.gte(quoteDetails.estimatedGasDca) &&
      quoteDetails.estimatedGasFormatted !== "0" &&
      quoteDetails.active
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
    weiSellAmount,
    numExec,
    unixStartDate,
    unixEndDate,
    freeTokenBal,
    freeGasBal,
    quoteDetails,
    weiDepositAmount,
  ]);

  const { config: prepareNewScheduleSetup } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "createDcaSchedule",
    enabled: enablePrep,
    args: [
      tradeFreq,
      weiSellAmount,
      buyToken.address,
      sellToken.address,
      unixStartDate,
      unixEndDate,
      parseEther(quoteDetails.estimatedGasFormatted),
    ],
    overrides: {
      from: address,
    },
    onError(error) {
      console.error("New Schedule Prepared Error", error);
    },
    onSuccess(data) {
      console.log("New Schedule Prepared Success", data);
    },
  });

  const { data, write: newSchedule } = useContractWrite({
    ...prepareNewScheduleSetup,
    onSuccess(data) {
      console.log("New Schedule Write Success", data);

      showNotification({
        id: "new-schedule-pending",
        loading: true,
        title: "Pending Schedule Creation",
        message: "Waiting for your tx...",
        autoClose: false,
        disallowClose: false,
      });
    },

    onError(error) {
      console.error("New Schedule Write Error", error);

      showNotification({
        id: "new-schedule-error",
        color: "red",
        title: "Error Creating Schedule",
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
      console.log("New Schedule Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Create Schedule",
      });

      updateNotification({
        id: "new-schedule-pending",
        color: "teal",
        title: "Schedule Created",
        message: "Let's go to the dashboard to view!",
        icon: <CircleCheck />,
        autoClose: true,
      });

      nav("/dashboard");
    },
    onError(error) {
      console.error("New Schedule Error", error);

      updateNotification({
        id: "new-schedule-pending",
        color: "red",
        title: "Error Creating Schedule",
        message: error.message,
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
              {sellAmount} {sellToken.symbol}
            </Text>
            <Text size="lg">to buy</Text>
            <Text weight={700} color="green">
              {buyToken.symbol}
            </Text>
            <Text size="lg">Every</Text>
            <Text weight={700} color="green">
              {tradeFreq.div(86400).toString()} Days
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
              {sellAmount} {sellToken.symbol}
            </Text>
            <Text size="lg">x</Text>
            <Text weight={700} color="green">
              {numExec} times
            </Text>
          </Group>

          {freeTokenBal.gt(0) && //run if additional deposit needed
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

          {freeTokenBal.lt(0) && //run if negative
            weiDepositAmount.gt(freeTokenBal) && (
              <Group align="end" position="left" spacing="xs">
                <Text size="lg">But you need</Text>
                <Text weight={700} color="red">
                  {formatUnits(freeTokenBal.abs(), sellToken.decimals)}{" "}
                  {sellToken.symbol}
                </Text>
                <Text size="lg">available so your deposit is </Text>
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
                <Text size="lg">
                  available, so an additional deposit is not needed!
                </Text>
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
            <Text size="lg">Your minimum gas deposit is</Text>
            <Text weight={700} color="green">
              {quoteDetails?.estimatedGasDcaFormattedSafe} {networkCurrency}
            </Text>
            <Text size="lg">because you're swapping</Text>
            <Text weight={700} color="green">
              {numExec} times
            </Text>
          </Group>

          {freeGasBal.gt(0) && //run if additional deposit needed
            quoteDetails?.estimatedGasDcaSafe.gt(freeGasBal) && (
              <Group align="end" position="left" spacing="xs">
                <Text size="lg">But you have</Text>
                <Text weight={700} color="green">
                  {formatEther(freeGasBal)} {networkCurrency}
                </Text>
                <Text size="lg">available so your deposit is just</Text>
                <Text weight={700} color="green">
                  {formatEther(
                    quoteDetails?.estimatedGasDcaSafe.sub(freeGasBal)
                  )}{" "}
                  {networkCurrency}
                </Text>
              </Group>
            )}

          {freeGasBal.lt(0) && //run if negative
            quoteDetails?.estimatedGasDcaSafe.gt(freeGasBal) && (
              <Group align="end" position="left" spacing="xs">
                <Text size="lg">But you need</Text>
                <Text weight={700} color="red">
                  {formatEther(freeGasBal.abs())} {networkCurrency}
                </Text>
                <Text size="lg">available so your deposit is </Text>
                <Text weight={700} color="green">
                  {formatEther(
                    quoteDetails?.estimatedGasDcaSafe.sub(freeGasBal)
                  )}{" "}
                  {networkCurrency}
                </Text>
              </Group>
            )}

          {!freeGasBal.eq(0) && //run if zero needed
            quoteDetails?.estimatedGasDcaSafe.lte(freeGasBal) && (
              <Group align="end" position="left" spacing="xs">
                <Text size="lg">But you have</Text>
                <Text weight={700} color="green">
                  {formatEther(freeGasBal)} {networkCurrency}
                </Text>
                <Text size="lg">
                  available, so an additional gas deposit is not needed!
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
