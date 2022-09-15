import { useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  createStyles,
  ScrollArea,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { Coin } from "tabler-icons-react";

import { BigNumber } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { IToken } from "../../models/Interfaces";
import { UserFundsProps } from "../../models/PropTypes";

import Big from "big.js";
import { useNetwork } from "wagmi";
import DeleteScheduleFlow from "../Scheduling/DeleteSchedueFlow";

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
    totalGas: string;
    numExecLeft: number;
    remainingBudget: string;
    deleteSchedule: any;
    freeBalanceRaw: BigNumber;
  }[];
}

function ScheduleTable({ data: tableData }: IUserScheduleInfo) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const { chain } = useNetwork();

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

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

          {row.isActive === true && row.remainingBudget !== "0" && (
            <Badge color="teal" size="md">
              Active
            </Badge>
          )}

          {row.isActive === false && row.remainingBudget === "0" && (
            <Badge color="violet" size="md">
              Complete
            </Badge>
          )}
          {row.remainingBudget !== "0" && row.freeBalanceRaw.lt(0) && (
            <Tooltip
              position="bottom"
              wrapLines
              width={220}
              withArrow
              transition="fade"
              transitionDuration={200}
              label="Switch tabs to the Manage Funds to see which schedule deposits need a topup or select token in DCA Amount."
            >
              <Badge color="red" size="md">
                {row.sellToken.symbol} Low Bal!
              </Badge>
            </Tooltip>
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
          <Text>
            {row.startDate.toLocaleDateString(undefined, {
              year: "2-digit",
              month: "2-digit",
              day: "numeric",
            })}
          </Text>
          <Text>to</Text>
          <Text>
            {row.endDate.toLocaleDateString(undefined, {
              year: "2-digit",
              month: "2-digit",
              day: "numeric",
              // hour: "numeric",
              // minute: "numeric",
            })}
          </Text>
        </Stack>
      </td>

      <td>
        {row.lastRun.toLocaleString().includes("12/31/1969") && "Never"}
        {!row.lastRun.toLocaleString().includes("12/31/1969") &&
          row.lastRun.toLocaleDateString(undefined, {
            year: "2-digit",
            month: "2-digit",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
      </td>
      <td>
        {row.nextRun.toLocaleDateString(undefined, {
          year: "2-digit",
          month: "2-digit",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </td>
      <td>
        {!row.boughtAmount.eq(0) && !row.soldAmount.eq(0) && (
          <Text>
            ~
            {parseFloat(
              Big(row.boughtAmount.toString())
                .div(Big(row.soldAmount.toString()))
                .toString()
            ).toFixed(6)}{" "}
            {row.buyToken?.symbol}
          </Text>
        )}

        {row.boughtAmount.eq(0) && row.soldAmount.eq(0) && (
          <Text>0 {row.buyToken?.symbol}</Text>
        )}
      </td>

      <td>
        ~
        {parseFloat(formatEther(row.totalGas.toString()).toString()).toFixed(6)}{" "}
        {networkCurrency}{" "}
      </td>

      <td>
        <Stack align="center" spacing="xs">
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
            <th>Budget Left</th>
            <th>DCA Amount</th>
            <th>Duration</th>
            <th>Last Run</th>
            <th>Next Run</th>
            <th>Avg Buy</th>
            <th>Gas Spent</th>
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
          freeBalanceRaw:
            mappedUserFunds[userSchedules[key].sellToken].freeBalanceRaw,

          deleteSchedule: DeleteScheduleFlow(Number(key), true)?.delete,
        };

        formattedUserSchedulesData.push(addSchedule);
      }
      return true;
    });
  }

  return <ScheduleTable data={formattedUserSchedulesData} />;
}
