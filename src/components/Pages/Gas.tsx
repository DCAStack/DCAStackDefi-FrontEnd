import React from "react";

import { Container, Title, Paper, Space, createStyles } from "@mantine/core";

import WithdrawFunds from "../Forms/Withdraw";
import DepositFunds from "../Forms/Deposit";

const useStyles = createStyles((theme) => ({
  // could improve this
  wrapper: {
    position: "relative",
    paddingTop: 20,
    paddingBottom: 80,
  },
}));

const Gas = () => {
  const { classes } = useStyles();

  return (
    <Container className={classes.wrapper} my="transact_gas">
      <Title order={1} align="center">
        Manage Gas
      </Title>
      <Space h="xl" />
      <Paper shadow="xl" radius="xl" p="xl" withBorder>
        <WithdrawFunds />
        <Space h="xl" />
        <DepositFunds />
      </Paper>
    </Container>
  );
};

export default Gas;
