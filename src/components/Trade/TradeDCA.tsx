import { useEffect, useState, useContext } from "react";

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
import { parseEther, formatEther } from "ethers/lib/utils";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { ActionIcon } from "@mantine/core";
import { SwitchHorizontal, PlayerPlay } from "tabler-icons-react";

import DepositGas from "../Banking/DepositGas";
import DepositFunds from "../Banking/DepositFunds";

import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";

import { nullToken } from "../../data/gasTokens";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

function TradeDCA() {
  const [date, setDate] = useState<[Date | null, Date | null]>([
    new Date(),
    dayjs(new Date()).add(1, "days").toDate(),
  ]);
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const currentChain: number = chain ? chain?.id : 0;

  const { classes } = useStyles();
  const [curUserGasBal, setUserGasBal] = useState("0");
  const [curUserBal, setUserBal] = useState("0");
  const [sellAmount, setSellAmount] = useState(0);
  const [tradeFreq, setTradeFreq] = useState(0);

  const [sellToken, setSellToken] = useState(nullToken);
  const [buyToken, setBuyToken] = useState(nullToken);
  const [depositAmount, setDepositAmount] = useState(0);
  const [numExec, setNumExec] = useState(0);

  const [quote1inch, setQuote1inch] = useState({ estimatedGasFormatted: "0" });

  const {
    quote: quoteDetails,
    isLoading: quoteLoading,
    isError: quoteError,
  } = use1inchRetrieveQuote(
    currentChain,
    sellToken,
    buyToken,
    String(sellAmount),
    tradeFreq
  );

  useEffect(() => {
    if (date[1] && date[0] && quoteDetails && sellAmount !== 0) {
      setNumExec(
        Math.floor(
          (date[1].valueOf() - date[0].valueOf()) / (tradeFreq * 86400 * 1000)
        )
      );

      setDepositAmount(numExec * sellAmount);

      if (quoteDetails.estimatedGasFormatted) {
        quoteDetails.estimatedGasFormatted =
          quoteDetails.estimatedGasFormatted * numExec * 1.5;
        setQuote1inch(quoteDetails);
      }
    }
  }, [quoteDetails, date, tradeFreq, sellAmount, numExec]);

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        addressOrName: contractAddr,
        contractInterface: contractABI,
        functionName: "userGasBalances",
        args: address,
      },
      {
        addressOrName: contractAddr,
        contractInterface: contractABI,
        functionName: "getFreeTokenBalance",
        args: [sellToken?.address],
      },
    ],
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get User Funds Success", data);
      let userGasBalance = data[0];
      userGasBalance
        ? setUserGasBal(String(formatEther(userGasBalance.toString())))
        : setUserGasBal("0");

      let userFundBalance = data[1];
      userFundBalance
        ? setUserBal(String(formatEther(userFundBalance.toString())))
        : setUserBal("0");
    },
    onError(error) {
      console.log("Get User Funds Error", error);
      setUserGasBal("0");
      setUserBal("0");
    },
  });

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

  return (
    <Container my="setup_schedule">
      <Container my="setup_swap">
        <Group align="center" position="center" spacing="xs" grow>
          <SwapToken text={"I want to sell"} updateToken={setSellToken} />
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            className={classes.input}
            onClick={() => {
              if (buyToken !== nullToken && sellToken !== nullToken) {
                console.log("SWAPPED pre", sellToken, buyToken);
              }
            }}
          >
            <SwitchHorizontal size={45} strokeWidth={3} />
          </ActionIcon>
          <SwapToken text={"To purchase"} updateToken={setBuyToken} />
        </Group>
      </Container>

      <Space h="xl" />

      <Container my="setup_dca">
        <Group align="end" position="center" spacing="xl" grow>
          <NumberInput
            label="Sell Amount"
            radius="xs"
            size="xl"
            hideControls
            placeholder="Sell each DCA..."
            required
            onChange={(val) => (val ? setSellAmount(val) : setSellAmount(0))}
          />
          <NumberInput
            label="Trade Frequency"
            placeholder="DCA every..."
            radius="xs"
            size="xl"
            required
            min={1}
            max={30}
            onChange={(val) => (val ? setTradeFreq(val) : setTradeFreq(0))}
          />
          <NativeSelect
            data={["Days"]}
            label="Trade On"
            radius="xs"
            size="xl"
            required
          />
        </Group>
      </Container>

      <Space h="xl" />

      <Container my="setup_date">
        <Group align="end" position="center" spacing="xl" grow>
          <DateRangePicker
            excludeDate={(date) =>
              tradeFreq !== 0 ? date.getDate() % tradeFreq !== 0 : false
            }
            firstDayOfWeek="sunday"
            dropdownType="modal"
            label="Select DCA Schedule"
            placeholder="Pick dates range"
            onChange={setDate}
            required
            radius="xs"
            size="xl"
            allowLevelChange
            minDate={dayjs(new Date()).toDate()}
          />
          <TimeInput
            value={new Date()}
            label="Start Time"
            format="12"
            radius="xs"
            size="xl"
            amLabel="am"
            pmLabel="pm"
            required
          />
        </Group>
      </Container>

      <Space h="xl" />

      <Container my="setup_deposits">
        <Group align="center" position="center" grow>
          <Stack>
            <Title order={4}>Contract Gas Balance</Title>
            {curUserGasBal !== "0" && (
              <Text size="lg" color="green">
                Have: {curUserGasBal} {networkCurrency}
              </Text>
            )}
            {curUserGasBal === "0" && (
              <Text size="lg" color="red">
                Have: {curUserGasBal} {networkCurrency}
              </Text>
            )}

            {Number(quote1inch?.estimatedGasFormatted) <=
              Number(curUserGasBal) && (
              <Text size="lg" color="green">
                Need: 0 {networkCurrency}
              </Text>
            )}
            {Number(quote1inch?.estimatedGasFormatted) >
              Number(curUserGasBal) && (
              <Text size="lg" color="red">
                Need:{" "}
                {Number(quote1inch?.estimatedGasFormatted) -
                  Number(curUserGasBal)}{" "}
                {networkCurrency}
              </Text>
            )}
          </Stack>

          <DepositGas
            defaultValue={
              Number(quote1inch?.estimatedGasFormatted) > Number(curUserGasBal)
                ? Number(quote1inch?.estimatedGasFormatted) -
                  Number(curUserGasBal)
                : 0
            }
          />
        </Group>

        <Space h="md" />

        <Group align="center" position="center" grow>
          <Stack>
            <Title order={4}>Contract Deposit Balance</Title>
            {curUserBal !== "0.0" && (
              <Text size="lg" color="green">
                Have: {curUserBal} {sellToken.symbol}
              </Text>
            )}
            {curUserBal === "0.0" && (
              <Text size="lg" color="red">
                Have: {curUserBal} {sellToken.symbol}
              </Text>
            )}

            {Number(curUserBal) < depositAmount && (
              <Text size="lg" color="red">
                Need: {depositAmount - Number(curUserBal)} {sellToken.symbol}
              </Text>
            )}
            {Number(curUserBal) >= depositAmount && (
              <Text size="lg" color="green">
                Need: 0 {sellToken.symbol}
              </Text>
            )}
          </Stack>
          <DepositFunds
            token={sellToken}
            defaultValue={
              Number(curUserBal) < depositAmount
                ? depositAmount - Number(curUserBal)
                : 0
            }
          />
        </Group>
      </Container>

      <Space h="xl" />

      <Container my="start_dca">
        <Group align="end" position="center" spacing="xs" grow>
          <Button
            fullWidth
            radius="xl"
            size="xl"
            variant="gradient"
            gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
          >
            {(sellAmount === 0 ||
              tradeFreq === 0 ||
              sellToken.symbol === "" ||
              buyToken.symbol === "") &&
              "Start DCA"}
            {sellAmount > 0 &&
              tradeFreq > 0 &&
              sellToken.symbol !== "" &&
              buyToken.symbol !== "" && (
                <Text size="xl">
                  Trade {sellAmount} {sellToken.symbol} for {buyToken.symbol}{" "}
                  Every {tradeFreq} Days for {numExec} Days
                </Text>
              )}
          </Button>
        </Group>
      </Container>
    </Container>
  );
}

export default TradeDCA;
