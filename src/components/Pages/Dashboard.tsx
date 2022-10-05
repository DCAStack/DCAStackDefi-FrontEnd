import { Container, Paper, Space, Title } from "@mantine/core";

import { Tabs } from "@mantine/core";
import { BuildingBank, Clock } from "tabler-icons-react";

import { UserBalancesPopulated } from "../Dashboard/BalanceTable";
import { UserSchedulesPopulated } from "../Dashboard/ScheduleTable";

import ManageDeposits from "../Dashboard/ManageDeposits";
import RetrieveUserInfo from "../Dashboard/RetrieveUserInfo";

const Dashboard = () => {
  const { mappedTokenBalances, parsedTokenBalances, userSchedules } =
    RetrieveUserInfo();
  return (
    <Container my="user_dashboard">
      <Title align="center">Dashboard</Title>
      <Space h="xl" />

      <Paper
        shadow="xl"
        radius="xl"
        p="xl"
        withBorder
        sx={(theme) => ({
          borderColor: theme.white,
          borderBlockColor: theme.white,
        })}
      >
        <Container my="setup_deposits">
          <ManageDeposits
            enableWithdraw={true}
            mappedUserFunds={mappedTokenBalances}
            userSchedules={userSchedules}
          />
        </Container>
      </Paper>
      <Space h="xl" />

      <Tabs tabPadding="xl" position="center" grow>
        <Tabs.Tab label="Schedules" icon={<Clock size={30} />}>
          <UserSchedulesPopulated
            mappedUserFunds={mappedTokenBalances}
            userSchedules={userSchedules}
          />
        </Tabs.Tab>

        <Tabs.Tab label="Funds" icon={<BuildingBank size={30} />}>
          <UserBalancesPopulated userFunds={parsedTokenBalances} />
        </Tabs.Tab>
      </Tabs>
    </Container>
  );
};

export default Dashboard;
