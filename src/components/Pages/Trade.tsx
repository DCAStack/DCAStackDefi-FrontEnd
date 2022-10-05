import { Container, Paper, Space, Title } from "@mantine/core";

import { Alert } from "@mantine/core";
import { AlertCircle } from "tabler-icons-react";

import TradeDCA from "../Trade/TradeDCA";

const Trade = () => {
  return (
    <Container my="setup_trade">
      <Title order={1} align="center">
        Setup New Schedule
      </Title>
      <Space h="xl" />
      <Alert
        icon={<AlertCircle size={16} />}
        title="No Fee to DCA!"
        radius="xs"
      >
        All DCA schedules have no fees during the initial launch. Enjoy DCAStack
        fam!
      </Alert>
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
        <TradeDCA />
      </Paper>
    </Container>
  );
};

export default Trade;
