import { Table, Group, ScrollArea, Button } from "@mantine/core";

import { createStyles } from "@mantine/core";

import { useState } from "react";

import { BigNumber } from "ethers";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import { UserFundsProps } from "../../models/PropTypes";
import WithdrawFundsFlow from "../Banking/WithdrawFundsFlow";
import { nullToken } from "../../data/gasTokens";
import { showNotification, updateNotification } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
    zIndex: 1000,
    top: 0,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease",

    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

interface IUserBalanceInfo {
  data: {
    logoURI: string;
    symbol: string;
    address: string;
    name: string;
    decimals: number;
    balance: string;
    freeBalance: string;
    withdrawMax: any;
    withdrawFree: any;
  }[];
}
export function UsersTable({ data }: IUserBalanceInfo) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);

  const rows = data.map((item) => (
    <tr key={item.address}>
      <td>
        <TokenBadgeDisplay token={item} />
      </td>
      <td>{item.balance}</td>
      <td>{item.freeBalance}</td>

      <td>
        <Group spacing="xs" position="center">
          <Button
            radius="xl"
            size="md"
            compact
            onClick={() => {
              item.withdrawFree?.action?.();
            }}
          >
            Withdraw Available
          </Button>
          <Button
            color="red"
            radius="xl"
            size="md"
            compact
            onClick={() => {
              item.withdrawMax?.action?.();
            }}
          >
            Withdraw All
          </Button>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea
      sx={{ height: 300 }}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table
        sx={{ minWidth: 800 }}
        verticalSpacing="sm"
        striped
        highlightOnHover
        fontSize="md"
      >
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Token</th>
            <th>Total Balance</th>
            <th>Balance Not Used in Schedules</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

export function UserBalancesPopulated({
  userFunds: parsedTokenBalances,
}: UserFundsProps) {
  let formattedUserData: IUserBalanceInfo["data"] = [];

  if (parsedTokenBalances) {
    Object.keys(parsedTokenBalances).map((key) => {
      if (parsedTokenBalances[Number(key)].address) {
        let addDetails = {
          withdrawMax:
            Number(parsedTokenBalances[Number(key)].balance) > 0
              ? WithdrawFundsFlow(
                  parsedTokenBalances[Number(key)],
                  parsedTokenBalances[Number(key)].balance
                )
              : null,
          withdrawFree:
            Number(parsedTokenBalances[Number(key)].freeBalance) > 0
              ? WithdrawFundsFlow(
                  parsedTokenBalances[Number(key)],
                  parsedTokenBalances[Number(key)].freeBalance
                )
              : null,
        };

        formattedUserData.push({
          ...parsedTokenBalances[Number(key)],
          ...addDetails,
        });
      }
    });
  }

  return <UsersTable data={formattedUserData} />;
}
