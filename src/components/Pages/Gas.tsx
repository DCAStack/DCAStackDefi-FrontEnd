import { useContext, useState } from "react";

import { Container, createStyles, Paper, Space, Title } from "@mantine/core";

import DepositGas from "../Banking/DepositGas";
import WithdrawGas from "../Banking/WithdrawGas";

import { useNetwork } from "wagmi";

import { Alert } from "@mantine/core";
import { AlertCircle } from "tabler-icons-react";

import { formatEther } from "ethers/lib/utils";
import { useAccount, useContractRead } from "wagmi";

import { BigNumber } from "ethers";
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
  const { chain } = useNetwork();
  const { address } = useAccount();
  const [curUserGasBal, setUserGasBal] = useState("0");

  useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "userGasBalances",
    args: address,
    cacheOnBlock: true,
    watch: true,
    enabled: address !== undefined,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get User Gas Success", data);
      data
        ? setUserGasBal(String(formatEther(data.toString())))
        : setUserGasBal("0");
    },
    onError(error) {
      console.error("Get User Gas Error", error);
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

        <DepositGas weiDefaultValue={BigNumber.from(0)} />
      </Paper>
    </Container>
  );
};

export default Gas;
