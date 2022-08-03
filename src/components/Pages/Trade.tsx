import React from "react";

import { Container, Title, Paper, Space, createStyles } from "@mantine/core";

import { useNetwork } from "wagmi";

import { Alert } from "@mantine/core";
import { AlertCircle } from "tabler-icons-react";

import { useContractRead } from "wagmi";
import { useAccount } from "wagmi";
import { formatEther } from "ethers/lib/utils";

import { ContractInfoProps } from "./../../models/PropTypes";

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

      <Space h="xl" />
      <Paper shadow="xl" radius="xl" p="xl" withBorder>
        <TradeDCA />
      </Paper>
    </Container>
  );
};

export default Trade;
