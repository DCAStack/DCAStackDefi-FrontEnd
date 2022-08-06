import React from "react";
import { useEffect, useState, useContext } from "react";

import { Container, Title, Paper, Space, createStyles } from "@mantine/core";

import WithdrawGas from "../Banking/WithdrawGas";
import DepositGas from "../Banking/DepositGas";

import { useNetwork } from "wagmi";

import { Alert } from "@mantine/core";
import { AlertCircle } from "tabler-icons-react";

import { useContractRead } from "wagmi";
import { useAccount } from "wagmi";
import { formatEther } from "ethers/lib/utils";

import { ContractContext } from "../../App";

const useStyles = createStyles((theme) => ({
  // could improve this
  wrapper: {
    position: "relative",
    paddingTop: 20,
    paddingBottom: 80,
  },
}));

const Gas = () => {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { classes } = useStyles();
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const [curUserGasBal, setUserGasBal] = useState("0");

  const {
    data: userGasBalance,
    isError,
    isLoading,
  } = useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "userGasBalances",
    args: address,
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get User Gas Success", data);
      data
        ? setUserGasBal(String(formatEther(data.toString())))
        : setUserGasBal("0");
    },
    onError(error) {
      console.log("Get User Gas Error", error);
      setUserGasBal("0");
    },
  });

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

  return (
    <Container className={classes.wrapper} my="transact_gas">
      <Title order={1} align="center">
        Current Gas Balance: {curUserGasBal} {networkCurrency}
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
        <WithdrawGas />
        <Space h="xl" />
        <Space h="xl" />

        <DepositGas />
      </Paper>
    </Container>
  );
};

export default Gas;
