import { useEffect, useState, useContext } from "react";

import { Container, Title, Paper, Space, createStyles } from "@mantine/core";

import WithdrawFunds from "../Banking/WithdrawFunds";
import { Tabs } from "@mantine/core";
import { BuildingBank, Clock, Cash, History } from "tabler-icons-react";

import { ContractContext } from "../../App";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import { formatUnits } from "ethers/lib/utils";

import { UserHistoryPopulated } from "../Dashboard/HistoryTable";
import { UserBalancesPopulated } from "../Dashboard/BalanceTable";
import { UserSchedulesPopulated } from "../Dashboard/ScheduleTable";
import { UserTradesPopulated } from "../Dashboard/TradeTable";
import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";

import { IUserFunds } from "../../models/Interfaces";

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
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address, isConnecting, isDisconnected } = useAccount();

  const { chain, chains } = useNetwork();

  const currentChain: number = chain ? chain?.id : 0;

  const {
    tokens: masterTokenList,
    isLoading: tokenFetchLoading,
    isError: tokenFetchIsError,
  } = use1inchRetrieveTokens(currentChain);

  const {
    data: userTokenBalances,
    isError,
    isLoading,
  } = useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "getUserAllTokenBalances",
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get All User Funds Success", data, typeof data);
    },
    onError(error) {
      console.log("Get All User Funds Error", error);
    },
  });

  let parsedTokenBalances: IUserFunds[] = [];
  let mappedTokenBalances: Record<string, IUserFunds> = {};

  if (userTokenBalances) {
    userTokenBalances[0].forEach(function (tokenAddr: string, index: number) {
      console.log(tokenAddr, index);
      let tokenDetails = masterTokenList?.tokens[tokenAddr?.toLowerCase()];
      console.log(tokenDetails);

      let addDetails = {
        logoURI: tokenDetails.logoURI,
        symbol: tokenDetails.symbol,
        address: tokenAddr,
        name: tokenDetails.name,
        decimals: tokenDetails.decimals,
        balance: formatUnits(
          userTokenBalances[1][index],
          tokenDetails.decimals
        ),
      };
      if (!parsedTokenBalances.includes(addDetails)) {
        parsedTokenBalances.push(addDetails);
        mappedTokenBalances[`${tokenAddr}`] = addDetails;
      }
    });
  }

  return (
    <Container className={classes.wrapper} my="setup_trade">
      <Title order={1} align="center">
        Dashboard
      </Title>
      <Space h="xl" />

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
        <WithdrawFunds userFunds={parsedTokenBalances} />
      </Paper>
      <Space h="xl" />

      <Tabs tabPadding="xl" grow position="center">
        <Tabs.Tab label="Schedule Balances" icon={<BuildingBank size={30} />}>
          <UserBalancesPopulated userFunds={parsedTokenBalances} />
        </Tabs.Tab>

        <Tabs.Tab label="Schedules" icon={<Clock size={30} />}>
          <UserSchedulesPopulated mappedUserFunds={mappedTokenBalances} />
        </Tabs.Tab>
        {/* 
        <Tabs.Tab label="Trades" icon={<Cash size={30} />}> 
          <UserTradesPopulated />
        </Tabs.Tab>

        <Tabs.Tab label="History" icon={<History size={30} />}>
          <UserHistoryPopulated />
        </Tabs.Tab> */}
      </Tabs>
    </Container>
  );
};

export default Dashboard;
