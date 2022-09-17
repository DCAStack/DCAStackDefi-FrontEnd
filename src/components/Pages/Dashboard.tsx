import { useContext } from "react";

import { Container, Paper, Space, Title } from "@mantine/core";

import { Tabs } from "@mantine/core";
import { BuildingBank, Clock } from "tabler-icons-react";
import { ContractContext } from "../../App";

import { formatUnits } from "ethers/lib/utils";
import { useAccount, useContractReads, useNetwork } from "wagmi";

import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";
import { UserBalancesPopulated } from "../Dashboard/BalanceTable";
import { UserSchedulesPopulated } from "../Dashboard/ScheduleTable";

import { BigNumber } from "ethers";
import { IUserFunds } from "../../models/Interfaces";
import ManageDeposits from "../Dashboard/ManageDeposits";

const Dashboard = () => {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address } = useAccount();

  const { chain } = useNetwork();

  const currentChain: number = chain ? chain?.id : 0;

  const { tokens: masterTokenList } = use1inchRetrieveTokens(currentChain);

  const { data: userTokenInfo } = useContractReads({
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
    enabled: address !== undefined,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get All User Data Info Success", data);
    },
    onError(error) {
      console.error("Get All User Data Info Error", error);
    },
  });

  let parsedTokenBalances: IUserFunds[] = [];
  let mappedTokenBalances: Record<string, IUserFunds> = {};
  let userTokenBalances = userTokenInfo ? userTokenInfo[0] : [[], [], []];
  let userTokenPurchasing = userTokenInfo ? userTokenInfo[1] : [[]];
  let userSchedules = userTokenInfo ? userTokenInfo[1] : [[]];

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

        if (tokenDetails) {
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
            balanceRaw: joinNeededTokens[1][index],
            freeBalanceRaw: joinNeededTokens[2][index],
          };
          if (!parsedTokenBalances.includes(addDetails)) {
            if (
              addDetails.freeBalance !== "0.0" ||
              addDetails.balance !== "0.0"
            ) {
              parsedTokenBalances.push(addDetails);
            }

            mappedTokenBalances[`${tokenAddr}`] = addDetails;
          }
        }
      }
    });
  }

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
