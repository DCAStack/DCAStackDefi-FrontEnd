import { useEffect, useState, useContext } from "react";

import {
  NumberInput,
  Grid,
  Container,
  Avatar,
  Space,
  Menu,
  Image,
  createStyles,
  Table,
  ScrollArea,
  Group,
  Button,
} from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon, ChevronDown } from "tabler-icons-react";
import GasToken from "../TokenDisplay/GasToken";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import swapTokens from "./../../data/swapTokens";
import { forwardRef } from "react";
import { Text, Select } from "@mantine/core";
import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";
import { BigNumber } from "ethers";
import { UserFundsProps } from "../../models/PropTypes";
import { IUserFunds } from "../../models/Interfaces";

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
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

function ScheduleTable({ data }: IUserScheduleInfo) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);

  const rows = data.map((row) => (
    <tr key={row.scheduleID}>
      <td>{row.scheduleID}</td>
      <td>
        {row.isActive === true && "Running"}
        {row.isActive === false && "Paused"}
      </td>
      <td>
        {row.sellToken.symbol} for {row.buyToken.symbol}
      </td>
      <td>
        {formatUnits(row.tradeAmount, row.sellToken.decimals)}{" "}
        {row.sellToken.symbol}
      </td>
      <td>{row.startDate.toString()}</td>
      <td>{row.endDate.toString()}</td>
      <td>{row.nextRun.toString()}</td>
      <td>{row.lastRun.toString()}</td>
      <td>
        {!row.boughtAmount.eq(0) &&
          !row.soldAmount.eq(0) &&
          row.boughtAmount.div(row.soldAmount).toString()}
      </td>

      <td>
        <Group spacing="xs" position="center">
          <Button color="orange" radius="xl" size="md" compact>
            Pause
          </Button>
          <Button color="red" radius="xl" size="md" compact>
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
      <Table sx={{ minWidth: 700 }} striped highlightOnHover>
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Schedule ID</th>
            <th>Status</th>
            <th>Trading Pair</th>
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
  const { address, isConnecting, isDisconnected } = useAccount();

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

  let formattedUserSchedulesData: IUserScheduleInfo["data"] = [];

  if (userSchedules && mappedUserFunds) {
    for (const key of Object.keys(userSchedules)) {
      console.log("fetching schedules ", key, userSchedules[key]);

      let addSchedule = {
        scheduleID: Number(key),
        isActive: userSchedules[key].isActive,
        tradeAmount: userSchedules[key].tradeAmount,
        startDate: new Date(userSchedules[key].scheduleDates[0] * 1000),
        endDate: new Date(userSchedules[key].scheduleDates[1] * 1000),
        nextRun: new Date(userSchedules[key].scheduleDates[2] * 1000),


        lastRun: new Date(userSchedules[key].scheduleDates[3] * 1000),

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
