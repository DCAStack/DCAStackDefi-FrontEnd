import { Container, Title, Paper, Space, createStyles } from "@mantine/core";

import { Alert } from "@mantine/core";
import { AlertCircle } from "tabler-icons-react";

import TradeDCA from "../Trade/TradeDCA";

const useStyles = createStyles((theme) => ({
  // could improve this
  wrapper: {
    position: "relative",
    paddingTop: 20,
    paddingBottom: 80,
  },
}));

const Trade = () => {
  const { classes } = useStyles();

  return (
    <Container className={classes.wrapper} my="setup_trade">
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
