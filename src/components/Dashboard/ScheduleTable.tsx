import { useState } from "react";

import {
  Avatar,
  createStyles,
  Table,
  ScrollArea,
  Button,
  Badge,
  Stack,
  Text,
} from "@mantine/core";
import { Coin } from "tabler-icons-react";

import { formatUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { UserFundsProps } from "../../models/PropTypes";
import { IToken } from "../../models/Interfaces";

import PauseScheduleFlow from "../Scheduling/PauseScheduleFlow";
import ResumeScheduleFlow from "../Scheduling/ResumeScheduleFlow";
import DeleteScheduleFlow from "../Scheduling/DeleteSchedueFlow";
import RefillTokenDepositFlow from "../Scheduling/RefillTokenDepositFlow";
import RefillGasDepositFlow from "../Scheduling/RefillGasDepositFlow";

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
    buyToken: IToken;
    sellToken: IToken;
    tradeFreq: string;
    numExecLeft: number;
    remainingBudget: string;
    gasRefillActions: any;
    tokenRefillActions: any;
    pauseSchedule: any;
    resumeSchedule: any;
    deleteSchedule: any;
  }[];
}

function ScheduleTable({ data: tableData }: IUserScheduleInfo) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);

  const rows = tableData.map((row) => (
    <tr key={row.scheduleID}>
      <td>
        <Stack align="center" spacing="xs">
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
        </Stack>
      </td>
      <td>
        {formatUnits(row.remainingBudget, row.sellToken?.decimals)}{" "}
        {row.sellToken?.symbol}
      </td>
      <td>
        {formatUnits(row.tradeAmount, row.sellToken?.decimals)}{" "}
        {row.sellToken?.symbol}
      </td>
      <td>
        <Stack spacing="xs">
          <Text>{row.startDate.toLocaleString()}</Text>
          <Text>to</Text>
          <Text>{row.endDate.toLocaleString()}</Text>
        </Stack>
      </td>

      <td>
        {row.lastRun.toLocaleString() === "12/31/1969, 7:00:00 PM" && "Never"}
        {row.lastRun.toLocaleString() !== "12/31/1969, 7:00:00 PM" &&
          row.lastRun.toLocaleString()}
      </td>
      <td>{row.nextRun.toLocaleString()}</td>
      <td>
        {!row.boughtAmount.eq(0) &&
          !row.soldAmount.eq(0) &&
          row.boughtAmount.div(row.soldAmount).toString()}
        {row.boughtAmount.eq(0) && row.soldAmount.eq(0) && 0}
      </td>

      <td>
        <Stack align="center" spacing="xs">
          {row.isActive === true && row.remainingBudget !== "0" && (
            <Button
              color="orange"
              radius="xl"
              size="md"
              compact
              onClick={() => {
                row.pauseSchedule?.();
              }}
            >
              Pause
            </Button>
          )}
          {row.remainingBudget === "0" && (
            <Button color="teal" radius="xl" size="md" compact>
              Complete
            </Button>
          )}
          {row.isActive === false && row.remainingBudget !== "0" && (
            <Button
              color="orange"
              radius="xl"
              size="md"
              compact
              onClick={() => {
                row.resumeSchedule?.resume?.();
              }}
              disabled={!row.resumeSchedule?.resumeStatus}
            >
              Resume
            </Button>
          )}

          {row.isActive === false &&
            row.remainingBudget !== "0" &&
            row.tokenRefillActions.needAmount !== "0.0" && (
              <Button
                radius="xl"
                size="md"
                compact
                onClick={() => {
                  row.tokenRefillActions.refill?.();
                }}
              >
                Topup Deposit
              </Button>
            )}

          {row.isActive === false &&
            row.remainingBudget !== "0" &&
            row.gasRefillActions.needAmount !== "0.0" && (
              <Button
                radius="xl"
                size="md"
                compact
                onClick={() => {
                  row.gasRefillActions.refill?.();
                }}
              >
                Topup Gas
              </Button>
            )}

          <Button
            color="red"
            radius="xl"
            size="md"
            compact
            onClick={() => {
              row.deleteSchedule?.();
            }}
          >
            Delete
          </Button>
        </Stack>
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
            <th>Budget</th>
            <th>DCA Amount</th>
            <th>Duration</th>
            <th>Last Run</th>
            <th>Next Run</th>
            <th>Average Buy In</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

export function UserSchedulesPopulated({
  mappedUserFunds,
  userSchedules,
}: UserFundsProps) {
  let formattedUserSchedulesData: IUserScheduleInfo["data"] = [];

  if (userSchedules && mappedUserFunds) {
    Object.keys(userSchedules).map((key) => {
      if (userSchedules[key].scheduleDates) {
        let addSchedule = {
          scheduleID: Number(key),
          isActive: userSchedules[key].isActive,
          tradeAmount: userSchedules[key].tradeAmount,
          startDate: new Date(userSchedules[key].scheduleDates[0] * 1000),
          lastRun: new Date(userSchedules[key].scheduleDates[1] * 1000),

          nextRun: new Date(userSchedules[key].scheduleDates[2] * 1000),
          nextRunRaw: userSchedules[key].scheduleDates[2],

          endDate: new Date(userSchedules[key].scheduleDates[3] * 1000),
          endDateRaw: userSchedules[key].scheduleDates[3],

          boughtAmount: userSchedules[key].boughtAmount,
          soldAmount: userSchedules[key].soldAmount,
          buyToken: mappedUserFunds[userSchedules[key].buyToken],
          sellToken: mappedUserFunds[userSchedules[key].sellToken],
          remainingBudget: userSchedules[key].remainingBudget.toString(),
          totalGas: userSchedules[key].totalGas,

          tradeFreq: userSchedules[key].tradeFrequency.toString(),
          tradeFreqRaw: userSchedules[key].tradeFrequency,

          numExecLeft: Math.floor(
            (new Date(userSchedules[key].scheduleDates[3] * 1000).valueOf() -
              new Date(userSchedules[key].scheduleDates[2] * 1000).valueOf()) /
              userSchedules[key].tradeFrequency.toString() /
              1000
          ),
          freeBalance:
            mappedUserFunds[userSchedules[key].sellToken].freeBalance,
          totalBalance: mappedUserFunds[userSchedules[key].sellToken].balance,

          tokenRefillActions: RefillTokenDepositFlow(
            !userSchedules[key].isActive,
            userSchedules[key].tradeAmount,
            userSchedules[key].tradeFrequency,
            userSchedules[key].scheduleDates[2],
            userSchedules[key].scheduleDates[3],
            mappedUserFunds[userSchedules[key].sellToken]
          ),

          gasRefillActions: RefillGasDepositFlow(
            !userSchedules[key].isActive,
            userSchedules[key].tradeAmount,
            userSchedules[key].tradeFrequency,
            userSchedules[key].scheduleDates[2],
            userSchedules[key].scheduleDates[3],
            mappedUserFunds[userSchedules[key].sellToken],
            mappedUserFunds[userSchedules[key].buyToken],
            Math.floor(
              (new Date(userSchedules[key].scheduleDates[3] * 1000).valueOf() -
                new Date(
                  userSchedules[key].scheduleDates[2] * 1000
                ).valueOf()) /
                userSchedules[key].tradeFrequency.toString() /
                1000
            )
          ),
          //actions
          pauseSchedule: PauseScheduleFlow(
            Number(key),
            userSchedules[key].isActive
          )?.pause,
          deleteSchedule: DeleteScheduleFlow(Number(key), true)?.delete,
          resumeSchedule: ResumeScheduleFlow(
            Number(key),
            !userSchedules[key].isActive,
            userSchedules[key].tradeAmount,
            userSchedules[key].tradeFrequency,
            mappedUserFunds[userSchedules[key].sellToken],
            mappedUserFunds[userSchedules[key].buyToken],
            Math.floor(
              (new Date(userSchedules[key].scheduleDates[3] * 1000).valueOf() -
                new Date(
                  userSchedules[key].scheduleDates[2] * 1000
                ).valueOf()) /
                userSchedules[key].tradeFrequency.toString() /
                1000
            )
          ),
        };

        formattedUserSchedulesData.push(addSchedule);
      }
    });
  }

  return <ScheduleTable data={formattedUserSchedulesData} />;
}
