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
  NativeSelect,
  Paper,
  Text,
  Title,
  Stack,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";

import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";
import SwapToken from "../Forms/SwapToken";
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

import DepositGas from "../Forms/DepositGas";
import DepositFunds from "../Forms/DepositFunds";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

function TradeDCA() {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();

  const { classes } = useStyles();
  const [date, setDate] = useState<Date | null>(new Date());
  const [curUserGasBal, setUserGasBal] = useState("0");
  const [curUserBal, setUserBal] = useState("0");
  const [sellAmount, setSellAmount] = useState(0);
  const [tradeFreq, setTradeFreq] = useState(0);

  const [sellToken, setSellToken] = useState({
    address: "",
    decimals: 0,
    logoURI: "",
    name: "",
    symbol: "",
  });
  const [buyToken, setBuyToken] = useState({
    address: "",
    decimals: 0,
    logoURI: "",
    name: "",
    symbol: "",
  });

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
        functionName: "userTokenBalances",
        args: [address, sellToken?.address],
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
        <Group align="end" position="center" spacing="xs" grow>
          <SwapToken text={"I want to sell"} updateToken={setSellToken} />
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            className={classes.input}
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
            description="I want to sell each DCA..."
            required
            onChange={(val) => (val ? setSellAmount(val) : setSellAmount(0))}
          />
          <NumberInput
            label="Trade Frequency"
            description="I want to DCA every..."
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
          <DatePicker
            dropdownType="modal"
            label="DCA Start Date"
            description="When to start"
            placeholder="Pick start date"
            value={date}
            onChange={setDate}
            required
            radius="xs"
            size="xl"
          />
          <TimeInput
            value={new Date()}
            label="Start Time"
            description="When to execute your DCA"
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
        <Group align="center" position="apart" spacing="xs" grow>
          <Stack>
            <Title order={4}>Contract Gas Balance</Title>
            <Text size="xl" color="green">
              {curUserGasBal} {networkCurrency}
            </Text>
          </Stack>
          <DepositGas />
        </Group>

        <Space h="md" />

        <Group align="center" position="apart" spacing="xs" grow>
          <Stack>
            <Title order={4}>Free Deposit Balance</Title>
            <Text size="xl" color="green">
              {curUserBal} {sellToken.symbol}
            </Text>
          </Stack>
          <DepositFunds token={sellToken} />
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
                  Every {tradeFreq} Days
                </Text>
              )}
          </Button>
        </Group>
      </Container>

      <Container my="user_stats"></Container>
    </Container>
  );
}

export default TradeDCA;
