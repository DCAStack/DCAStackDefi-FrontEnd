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
  useContractWrite,
  useAccount,
  useBalance,
  useContractReads,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { ActionIcon } from "@mantine/core";
import { SwitchHorizontal, PlayerPlay } from "tabler-icons-react";

import DepositGas from "../Banking/DepositGas";
import DepositFunds from "../Banking/DepositFunds";

import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";

import { nullToken } from "../../data/gasTokens";
import NewSchedule from "./NewSchedule";
import SetupDeposits from "./SetupDeposits";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

function TradeDCA() {
  const [date, setDate] = useState<[Date | null, Date | null]>([null, null]);
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const currentChain: number = chain ? chain?.id : 0;

  const { classes } = useStyles();

  const [sellAmount, setSellAmount] = useState(BigNumber.from(0));
  const [tradeFreq, setTradeFreq] = useState(0);

  const [sellToken, setSellToken] = useState(nullToken);
  const [buyToken, setBuyToken] = useState(nullToken);
  const [depositAmount, setDepositAmount] = useState(BigNumber.from(0));
  const [numExec, setNumExec] = useState(0);

  const [quote1inch, setQuote1inch] = useState({
    estimatedGasDca: BigNumber.from(0),
  });

  const {
    quote: quoteDetails,
    isLoading: quoteLoading,
    isError: quoteError,
  } = use1inchRetrieveQuote(
    currentChain,
    sellToken,
    buyToken,
    sellAmount.toString(),
    tradeFreq,
    date[0],
    date[1],
    numExec
  );

  useEffect(() => {
    if (date[1] && date[0] && !sellAmount.isZero() && tradeFreq !== 0) {
      setNumExec(
        Math.floor(
          (date[1].valueOf() - date[0].valueOf()) / (tradeFreq * 86400 * 1000)
        )
      );

      console.log("1inch", quoteDetails, quoteError);
      setDepositAmount(sellAmount.mul(numExec));
      setQuote1inch(quoteDetails);
    }
  }, [quoteDetails, date, tradeFreq, sellAmount, numExec, quoteError]);

  return (
    <Container my="setup_schedule">
      <Container my="setup_swap">
        <Group align="center" position="center" spacing="xs" grow>
          <SwapToken
            text={"I want to sell"}
            updateToken={setSellToken}
            currToken={sellToken}
          />
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            className={classes.input}
            onClick={() => {
              if (buyToken !== nullToken && sellToken !== nullToken) {
                const tempBuyToken = { ...buyToken };
                const tempSellToken = { ...sellToken };
                setSellToken(tempBuyToken);
                setBuyToken(tempSellToken);
              }
            }}
          >
            <SwitchHorizontal size={45} strokeWidth={3} />
          </ActionIcon>
          <SwapToken
            text={"To purchase"}
            updateToken={setBuyToken}
            currToken={buyToken}
          />
        </Group>
      </Container>

      <Space h="xl" />

      <Container my="setup_dca">
        <Group align="end" position="center" spacing="xl" grow>
          <NumberInput
            // precision={sellToken.decimals}
            label="Sell Amount"
            radius="xs"
            size="xl"
            hideControls
            placeholder="Sell each DCA..."
            required
            onChange={(val) =>
              val
                ? setSellAmount(BigNumber.from(val))
                : setSellAmount(BigNumber.from(0))
            }
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
        <SetupDeposits
          sellToken={sellToken}
          estimatedGas={quote1inch?.estimatedGasDca}
          depositAmount={depositAmount}
        />
      </Container>

      <Space h="xl" />

      <Container my="start_dca">
        <NewSchedule
          sellToken={sellToken}
          buyToken={buyToken}
          sellAmount={sellAmount}
          tradeFreq={tradeFreq}
          numExec={numExec}
          startDate={date[0]}
          endDate={date[1]}
        />
      </Container>
    </Container>
  );
}

export default TradeDCA;
