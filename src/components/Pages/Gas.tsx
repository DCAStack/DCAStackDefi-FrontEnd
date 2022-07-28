import React from "react";

import { Container, Title, Paper, Space, createStyles } from "@mantine/core";
import { Box } from "@mantine/core";

import WithdrawFunds from "../Forms/Withdraw";
import DepositFunds from "../Forms/Deposit";

import { useNetwork } from "wagmi";

import { Alert } from "@mantine/core";
import { AlertCircle } from "tabler-icons-react";

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
  const { chain, chains } = useNetwork();

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

  const accountGasBalance: string = "?";

  return (
    <Container className={classes.wrapper} my="transact_gas">
      <Title order={1} align="center">
        Current Gas Balance: {accountGasBalance} {networkCurrency}
      </Title>
      <Space h="xl" />

      <Alert
        icon={<AlertCircle size={16} />}
        title="Fund Your Account"
        radius="xs"
      >
        Be sure to fund your account with gas first! This will allow you to
        automate your DCA schedules.
      </Alert>

      <Space h="xl" />
      <Paper shadow="xl" radius="xl" p="xl" withBorder>
        <WithdrawFunds />
        <Space h="xl" />
        <Space h="xl" />

        <DepositFunds />
      </Paper>
    </Container>
  );
};

export default Gas;
