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
  Stepper,
  ActionIcon,
} from "@mantine/core";
import { DateRangePicker, TimeInput } from "@mantine/dates";

import { showNotification, updateNotification } from "@mantine/notifications";
import SwapToken from "./SwapToken";
import dayjs from "dayjs";

import { useAccount, useNetwork, useContractReads } from "wagmi";
import { BigNumber } from "ethers";

import { ContractContext } from "../../App";
import { SwitchHorizontal } from "tabler-icons-react";

import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";

import { nullToken } from "../../data/gasTokens";
import NewSchedule from "./NewSchedule";
import SetupDeposits from "./SetupDeposits";
import { formatUnits, parseUnits } from "ethers/lib/utils";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

function TradeDCA() {
  const [date, setDate] = useState<[Date | null, Date | null]>([null, null]);
  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 2 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));
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
  const [enableRead, setEnableRead] = useState(false);

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

      console.log("1inch", quoteDetails, quoteError, typeof quoteDetails);
      setDepositAmount(sellAmount.mul(numExec));
      setQuote1inch(quoteDetails);
      setEnableRead(true);
    }
  }, [quoteDetails, date, tradeFreq, sellAmount, numExec, quoteError]);

  const bnZero = BigNumber.from(0);
  const [freeGasBal, setUserGasBal] = useState<BigNumber>(bnZero);
  const [freeTokenBal, setUserBal] = useState<BigNumber>(bnZero);

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        addressOrName: contractAddr,
        contractInterface: contractABI,
        functionName: "getFreeGasBalance",
        args: [quote1inch?.estimatedGasDca],
      },
      {
        addressOrName: contractAddr,
        contractInterface: contractABI,
        functionName: "getFreeTokenBalance",
        args: [sellToken?.address],
      },
    ],
    enabled: enableRead,
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get User Funds Success", data);
      let userGasBalance = data[0];
      userGasBalance
        ? setUserGasBal(BigNumber.from(userGasBalance._hex))
        : setUserGasBal(bnZero);

      console.log("Free gas balance is", userGasBalance?.toString());

      let userFundBalance = data[1];
      userFundBalance
        ? setUserBal(BigNumber.from(userFundBalance._hex))
        : setUserBal(bnZero);

      console.log(
        "Free token balance is",
        userFundBalance?.toString(),
        sellToken?.address
      );
    },
    onError(error) {
      console.log("Get User Funds Error", error);
      setUserGasBal(bnZero);
      setUserBal(bnZero);
    },
  });

  return (
    <>
      <Stepper
        active={active}
        onStepClick={setActive}
        breakpoint="sm"
        size="xl"
      >
        <Stepper.Step label="First step" description="Setup DCA Schedule">
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
                    const tempBuyToken = { ...buyToken };
                    const tempSellToken = { ...sellToken };
                    setSellToken(tempBuyToken);
                    setBuyToken(tempSellToken);
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
                  label="Sell Amount"
                  precision={sellToken?.decimals}
                  value={Number(formatUnits(sellAmount, sellToken?.decimals))}
                  radius="xs"
                  size="xl"
                  hideControls
                  placeholder="Sell each DCA..."
                  required
                  onChange={(val) =>
                    val
                      ? setSellAmount(
                          parseUnits(String(val), sellToken?.decimals)
                        )
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
                  value={tradeFreq}
                  onChange={(val) =>
                    val ? setTradeFreq(val) : setTradeFreq(0)
                  }
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
                  value={date}
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
                freeGasBal={freeGasBal}
                freeTokenBal={freeTokenBal}
              />
            </Container>
          </Container>
        </Stepper.Step>
        <Stepper.Step label="Second step" description="Verify Details">
          <Container my="start_dca">
            <NewSchedule
              sellToken={sellToken}
              buyToken={buyToken}
              sellAmount={sellAmount}
              tradeFreq={BigNumber.from(tradeFreq * 86400)}
              numExec={numExec}
              startDate={date[0]}
              endDate={date[1]}
              quoteDetails={quote1inch}
              freeGasBal={freeGasBal}
              freeTokenBal={freeTokenBal}
              depositAmount={depositAmount}
            />
          </Container>
        </Stepper.Step>
      </Stepper>

      <Group position="center" mt="xl" grow>
        {active !== 0 && (
          <Button variant="default" onClick={prevStep} size="xl">
            Back
          </Button>
        )}
        {active === 0 && (
          <Button onClick={nextStep} size="xl">
            Review
          </Button>
        )}
      </Group>
    </>
  );
}

export default TradeDCA;
