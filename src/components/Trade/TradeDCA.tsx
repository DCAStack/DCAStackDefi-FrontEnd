import { ChangeEvent, useContext, useEffect, useState } from "react";

import {
  ActionIcon,
  Button,
  Container,
  createStyles,
  Group,
  NativeSelect,
  NumberInput,
  Space,
  Stepper,
  TextInput,
} from "@mantine/core";
import { DateRangePicker, TimeInput } from "@mantine/dates";

import dayjs from "dayjs";
import SwapToken from "./SwapToken";

import { BigNumber } from "ethers";
import { useAccount, useContractRead, useNetwork } from "wagmi";

import { SwitchHorizontal } from "tabler-icons-react";
import { ContractContext } from "../../App";

import use0xRetrieveQuote from "../../apis/0x/RetrieveQuote";

import { parseEther, parseUnits } from "ethers/lib/utils";
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
  const [time, setTime] = useState<Date>(new Date());

  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 4 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain } = useNetwork();
  const { address } = useAccount();
  const currentChain: number = chain ? chain?.id : 0;

  const { classes } = useStyles();

  const [sellAmount, setSellAmount] = useState("0");
  const [tradeFreq, setTradeFreq] = useState(0);

  const [sellToken, setSellToken] = useState(nullToken);
  const [buyToken, setBuyToken] = useState(nullToken);
  const [depositAmount, setDepositAmount] = useState(BigNumber.from(0));
  const [numExec, setNumExec] = useState(0);
  const [enableRead, setEnableRead] = useState(false);

  const [quote1inch, setQuote1inch] = useState({
    estimatedGasDcaSafe: BigNumber.from(0),
    estimatedGasFormatted: "0",
  });

  const { quote: quoteDetails, isError: quoteError } = use0xRetrieveQuote(
    currentChain,
    sellToken,
    buyToken,
    sellAmount,
    tradeFreq,
    date[0],
    date[1],
    numExec,
    true
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const re = /^\d*\.?\d*$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      setSellAmount(event.target.value);
    }
  };

  useEffect(() => {
    if (
      date[1] &&
      date[0] &&
      sellAmount !== "" &&
      sellAmount !== "0" &&
      tradeFreq !== 0
    ) {
      setNumExec(
        Math.floor(
          (date[1].valueOf() - date[0].valueOf()) / (tradeFreq * 86400 * 1000)
        )
      );

      if (quoteDetails) {
        setQuote1inch(quoteDetails);
        setEnableRead(true);
      }

      const sellAmountFormatted =
        sellToken?.decimals !== 0
          ? parseUnits(
              sellAmount !== "" ? sellAmount : "0",
              sellToken?.decimals
            )
          : BigNumber.from(0);
      setDepositAmount(sellAmountFormatted.mul(numExec));
    }
  }, [
    quoteDetails,
    quote1inch,
    date,
    tradeFreq,
    sellAmount,
    numExec,
    quoteError,
    sellToken?.decimals,
  ]);

  const bnZero = BigNumber.from(0);
  const [freeGasBal, setUserGasBal] = useState<BigNumber>(bnZero);
  const [freeTokenBal, setUserBal] = useState<BigNumber>(bnZero);

  useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "getFreeGasBalance",
    args: [parseEther(quote1inch.estimatedGasFormatted)], //gas for single trade
    enabled: enableRead,
    cacheOnBlock: true,
    watch: true,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get User Free Gas Success", data);
      let userGasBalance = data;
      userGasBalance
        ? setUserGasBal(BigNumber.from(userGasBalance._hex))
        : setUserGasBal(bnZero);

      console.log("Free gas balance is", userGasBalance?.toString());
    },
    onError(error) {
      console.error("Get User Free Gas Error", error);
      setUserGasBal(bnZero);
      setUserBal(bnZero);
    },
  });

  useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "getFreeTokenBalance",
    args: [sellToken?.address],
    enabled: enableRead,
    cacheOnBlock: true,
    watch: true,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get User Free Token Success", data);

      let userFundBalance = data;
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
      console.error("Get User Free Token Error", error);
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
        <Stepper.Step label="First Step" description="Trading Pairs">
          <Space h="xl" />

          <Container my="setup_schedule">
            <Container my="setup_swap">
              <Group align="center" position="center" spacing="xs" grow>
                <SwapToken
                  text={"I want to sell"}
                  updateToken={setSellToken}
                  currToken={sellToken}
                  isSell={true}
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
                  isSell={false}
                />
              </Group>
            </Container>

            <Space h="xl" />
          </Container>
        </Stepper.Step>

        <Stepper.Step label="Second Step" description="Frequency">
          <Space h="xl" />

          <Container my="schedule_frequency">
            <Container my="setup_dca">
              <Group align="end" position="center" spacing="xl" grow>
                <TextInput
                  label="Sell Amount"
                  value={sellAmount}
                  radius="xs"
                  size="xl"
                  placeholder="Sell each DCA..."
                  required
                  onChange={handleChange}
                />
                <NumberInput
                  label="Trade Every"
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
                  disabled
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
                  inputFormat="MM/DD/YY"
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
                  value={time}
                  onChange={setTime}
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
          </Container>
        </Stepper.Step>

        <Stepper.Step label="Third Step" description="Balances">
          <Space h="xl" />

          <Container my="schedule_balances">
            <Container my="setup_deposits">
              <SetupDeposits
                sellToken={sellToken}
                estimatedGas={quote1inch?.estimatedGasDcaSafe}
                depositAmount={depositAmount}
                freeGasBal={freeGasBal}
                freeTokenBal={freeTokenBal}
              />
            </Container>
          </Container>
        </Stepper.Step>

        <Stepper.Step label="Last Step" description="Verify Details">
          <Space h="xl" />

          <Container my="start_dca">
            <NewSchedule
              sellToken={sellToken}
              buyToken={buyToken}
              sellAmount={sellAmount}
              tradeFreq={BigNumber.from(tradeFreq * 86400)}
              numExec={numExec}
              startDate={date[0]}
              endDate={date[1]}
              startTime={time}
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
        {active !== 3 && (
          <Button onClick={nextStep} size="xl">
            Next
          </Button>
        )}
      </Group>
    </>
  );
}

export default TradeDCA;
