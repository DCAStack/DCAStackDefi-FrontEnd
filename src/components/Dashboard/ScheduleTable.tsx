import { useState, useContext } from "react";

import {
  Avatar,
  createStyles,
  Table,
  ScrollArea,
  Group,
  Button,
  Badge,
} from "@mantine/core";
import { Coin } from "tabler-icons-react";

import { useAccount, useContractRead, useNetwork } from "wagmi";
import { formatUnits } from "ethers/lib/utils";
import { ContractContext } from "../../App";
import { BigNumber } from "ethers";
import { UserFundsProps } from "../../models/PropTypes";
import { IUserFunds } from "../../models/Interfaces";

import PauseScheduleFlow from "../Scheduling/PauseScheduleFlow";
import ResumeScheduleFlow from "../Scheduling/ResumeScheduleFlow";
import DeleteScheduleFlow from "../Scheduling/DeleteSchedueFlow";
import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";
import { nullToken } from "../../data/gasTokens";

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
    zIndex: 1000,
    top: 0,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease",

    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

interface IUserScheduleInfo {
  data: {
    scheduleID: number;
    isActive: boolean;
    tradeAmount: BigNumber;
    startDate: Date;
    endDate: Date;
    nextRun: Date;
    lastRun: Date;
    boughtAmount: BigNumber;
    soldAmount: BigNumber;
    buyToken: IUserFunds;
    sellToken: IUserFunds;
  }[];
}

function ScheduleTable({ data: tableData }: IUserScheduleInfo) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const [scheduleId, setScheduleId] = useState(0);
  const [enablePause, setEnablePause] = useState(false);
  const [enableResume, setEnableResume] = useState(false);
  const [enableDelete, setEnableDelete] = useState(false);

  let pauseScheduleActions = PauseScheduleFlow(scheduleId, enablePause);
  let resumeScheduleActions = ResumeScheduleFlow(scheduleId, enableResume);
  let deleteScheduleActions = DeleteScheduleFlow(scheduleId, enableDelete);

  const rows = tableData.map((row) => (
    <tr key={row.scheduleID}>
      <td>
        <Badge
          sx={{ paddingLeft: 0, paddingRight: 0 }}
          size="lg"
          leftSection={
            <Avatar
              alt="Sell Token Avatar"
              size={20}
              src={row.sellToken?.logoURI}
            >
              <Coin size={30} />
            </Avatar>
          }
          rightSection={
            <Avatar
              alt="Buy Token Avatar"
              size={20}
              src={row.buyToken?.logoURI}
            >
              <Coin size={30} />
            </Avatar>
          }
        >
          {row.sellToken?.symbol} / {row.buyToken?.symbol}
        </Badge>
      </td>
      <td>
        {row.isActive === true && (
          <Badge color="teal" size="md">
            Running
          </Badge>
        )}
        {row.isActive === false && (
          <Badge color="orange" size="md">
            Paused
          </Badge>
        )}
      </td>

      <td>
        {formatUnits(row.tradeAmount, row.sellToken?.decimals)}{" "}
        {row.sellToken?.symbol}
      </td>
      <td>{row.startDate.toLocaleString()}</td>

      <td>
        {row.lastRun.toLocaleString() === "12/31/1969, 7:00:00 PM" && "Never"}
        {row.lastRun.toLocaleString() !== "12/31/1969, 7:00:00 PM" &&
          row.lastRun.toLocaleString()}
      </td>
      <td>{row.nextRun.toLocaleString()}</td>
      <td>{row.endDate.toLocaleString()}</td>
      <td>
        {!row.boughtAmount.eq(0) &&
          !row.soldAmount.eq(0) &&
          row.boughtAmount.div(row.soldAmount).toString()}
        {row.boughtAmount.eq(0) && row.soldAmount.eq(0) && 0}
      </td>

      <td>
        <Group spacing="xs" position="center">
          {row.isActive === true && (
            <Button
              color="orange"
              radius="xl"
              size="md"
              compact
              onMouseOver={() => {
                setScheduleId(row.scheduleID);
                setEnablePause(true);
              }}
              onClick={() => {
                pauseScheduleActions.pause?.();
              }}
            >
              Pause
            </Button>
          )}
          {row.isActive === false && (
            <Button
              color="teal"
              radius="xl"
              size="md"
              compact
              onMouseOver={() => {
                setScheduleId(row.scheduleID);
                setEnableResume(true);
              }}
              onClick={() => {
                resumeScheduleActions.resume?.();
              }}
            >
              Resume
            </Button>
          )}

          <Button
            color="red"
            radius="xl"
            size="md"
            compact
            onMouseOver={() => {
              setScheduleId(row.scheduleID);
              setEnableDelete(true);
            }}
            onClick={() => {
              deleteScheduleActions.delete?.();
            }}
          >
            Delete
          </Button>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea
      sx={{ height: 300 }}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table sx={{ minWidth: 800 }} striped highlightOnHover fontSize="md">
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Trading Pair</th>
            <th>Status</th>
            <th>DCA Amount</th>
            <th>Start Date</th>
            <th>Last Run</th>
            <th>Next Run</th>
            <th>End Date</th>
            <th>Average Buy In</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

export function UserSchedulesPopulated({ mappedUserFunds }: UserFundsProps) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain, chains } = useNetwork();
  const currentChain: number = chain ? chain?.id : 0;
  const [sellToken, setSellToken] = useState(nullToken);
  const [buyToken, setBuyToken] = useState(nullToken);
  const [sellAmount, setSellAmount] = useState("");
  const [tradeFreq, setTradeFreq] = useState(0);
  const [date0, setStartDate] = useState<Date | null>(null);
  const [date1, setEndDate] = useState<Date | null>(null);
  const [numExec, setNumExec] = useState(0);

  const {
    data: userSchedules,
    isError,
    isLoading,
  } = useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "getUserSchedules",
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get All User Schedules Success", data);
    },
    onError(error) {
      console.log("Get All User Schedules Error", error);
    },
  });

  const {
    quote: quoteDetails,
    isLoading: quoteLoading,
    isError: quoteError,
  } = use1inchRetrieveQuote(
    currentChain,
    sellToken,
    buyToken,
    sellAmount,
    tradeFreq,
    date0,
    date1,
    numExec
  );

  let formattedUserSchedulesData: IUserScheduleInfo["data"] = [];

  if (userSchedules && mappedUserFunds) {
    for (const key of Object.keys(userSchedules)) {
      if (userSchedules[key].isActive === false) {
        //fetch quote
      }

      let addSchedule = {
        scheduleID: Number(key),
        isActive: userSchedules[key].isActive,
        tradeAmount: userSchedules[key].tradeAmount,
        startDate: new Date(userSchedules[key].scheduleDates[0] * 1000),
        lastRun: new Date(userSchedules[key].scheduleDates[1] * 1000),
        nextRun: new Date(userSchedules[key].scheduleDates[2] * 1000),
        endDate: new Date(userSchedules[key].scheduleDates[3] * 1000),

        boughtAmount: userSchedules[key].boughtAmount,
        soldAmount: userSchedules[key].soldAmount,
        buyToken: mappedUserFunds[userSchedules[key].buyToken],
        sellToken: mappedUserFunds[userSchedules[key].sellToken],
        // remainingBudget: userSchedules[key].remainingBudget,
        // totalGas: userSchedules[key].totalGas,
        // tradeFrequency: userSchedules[key].tradeFrequency,
      };
      formattedUserSchedulesData.push(addSchedule);
    }
  }

  return <ScheduleTable data={formattedUserSchedulesData} />;
}
