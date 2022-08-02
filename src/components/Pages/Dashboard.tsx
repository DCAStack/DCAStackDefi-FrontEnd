import React from "react";

import { Container, Title, Paper, Space, createStyles } from "@mantine/core";

import WithdrawFunds from "../Forms/WithdrawFunds";
import { Tabs } from "@mantine/core";
import { BuildingBank, Clock, Cash, History } from "tabler-icons-react";

import { useNetwork } from "wagmi";

import { Alert } from "@mantine/core";
import { AlertCircle } from "tabler-icons-react";

import { useContractRead } from "wagmi";
import { useAccount } from "wagmi";
import { formatEther } from "ethers/lib/utils";

import { UserHistoryPopulated } from "../Dashboard/HistoryTable";
import { UserBalancesPopulated } from "../Dashboard/BalanceTable";
import { UserSchedulesPopulated } from "../Dashboard/ScheduleTable";
import { UserTradesPopulated } from "../Dashboard/TradeTable";

const useStyles = createStyles((theme) => ({
  // could improve this
  wrapper: {
    position: "relative",
    paddingTop: 20,
    paddingBottom: 80,
  },
}));

const Dashboard = () => {
  const { classes } = useStyles();

  return (
    <Container className={classes.wrapper} my="setup_trade">
      <Title order={1} align="center">
        Dashboard
      </Title>
      <Space h="xl" />

      <Space h="xl" />
      <Paper shadow="xl" radius="xl" p="xl" withBorder>
        <WithdrawFunds />
      </Paper>
      <Space h="xl" />

      <Tabs tabPadding="xl" grow position="center">
        <Tabs.Tab label="Schedule Balances" icon={<BuildingBank size={30} />}>
          <UserBalancesPopulated />
        </Tabs.Tab>

        <Tabs.Tab label="Schedules" icon={<Clock size={30} />}>
          <UserSchedulesPopulated />
        </Tabs.Tab>

        <Tabs.Tab label="Trades" icon={<Cash size={30} />}>
          <UserTradesPopulated />
        </Tabs.Tab>

        <Tabs.Tab label="History" icon={<History size={30} />}>
          <UserHistoryPopulated />
        </Tabs.Tab>
      </Tabs>
    </Container>
  );
};

export default Dashboard;
