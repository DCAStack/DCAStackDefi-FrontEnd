import { useEffect, useState, useContext } from "react";

import { Container, Title, Paper, Space, createStyles } from "@mantine/core";

import ManageScheduleFunds from "../Banking/ManageScheduleFunds";

import { Tabs } from "@mantine/core";
import { BuildingBank, Clock, Cash, History } from "tabler-icons-react";

import { ContractContext } from "../../App";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractReads,
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
import { BigNumber } from "ethers";

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
    data: userTokenInfo,
    isError,
    isLoading,
  } = useContractReads({
    contracts: [
      {
        addressOrName: contractAddr,
        contractInterface: contractABI,
        functionName: "getUserAllTokenBalances",
      },
      {
        addressOrName: contractAddr,
        contractInterface: contractABI,
        functionName: "getUserSchedules",
      },
    ],
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get All User Token Info Success", data);
    },
    onError(error) {
      console.log("Get All User Token Info Error", error);
    },
  });

  let parsedTokenBalances: IUserFunds[] = [];
  let mappedTokenBalances: Record<string, IUserFunds> = {};
  let userTokenBalances = userTokenInfo ? userTokenInfo[0] : [[], [], []];
  let userTokenPurchasing = userTokenInfo ? userTokenInfo[1] : [[]];
  let joinNeededTokens: any = [[], [], []];

  if (userTokenPurchasing) {
    for (const key of Object.keys(userTokenPurchasing)) {
      joinNeededTokens[0].push(userTokenPurchasing[key].buyToken);
    }
  }

  if (userTokenBalances) {
    joinNeededTokens[1] = joinNeededTokens[1].concat(
      Array(joinNeededTokens[0].length).fill(BigNumber.from(0))
    );
    joinNeededTokens[2] = joinNeededTokens[2].concat(
      Array(joinNeededTokens[0].length).fill(BigNumber.from(0))
    );

    joinNeededTokens[0] = joinNeededTokens[0].concat(userTokenBalances[0]);
    joinNeededTokens[1] = joinNeededTokens[1].concat(userTokenBalances[1]);
    joinNeededTokens[2] = joinNeededTokens[2].concat(userTokenBalances[2]);
  }

  if (joinNeededTokens) {
    joinNeededTokens[0].forEach(function (tokenAddr: string, index: number) {
      if (tokenAddr) {
        let tokenDetails = masterTokenList?.tokens[tokenAddr?.toLowerCase()];

        let addDetails = {
          logoURI: tokenDetails.logoURI,
          symbol: tokenDetails.symbol,
          address: tokenAddr,
          name: tokenDetails.name,
          decimals: tokenDetails.decimals,
          balance: formatUnits(
            joinNeededTokens[1][index],
            tokenDetails.decimals
          ),
          freeBalance: formatUnits(
            joinNeededTokens[2][index],
            tokenDetails.decimals
          ),
        };
        if (!parsedTokenBalances.includes(addDetails)) {
          if (addDetails.balance !== "0.0") {
            parsedTokenBalances.push(addDetails);
          }
          mappedTokenBalances[`${tokenAddr}`] = addDetails;
        }
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
        <ManageScheduleFunds userFunds={parsedTokenBalances} />
      </Paper>
      <Space h="xl" />

      <Tabs tabPadding="xl" position="center" grow>
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
