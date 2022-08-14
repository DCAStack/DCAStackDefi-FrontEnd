import { Table, Group, ScrollArea, Button } from "@mantine/core";

import { createStyles } from "@mantine/core";

import { useState } from "react";

import { parseUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import ViewToken from "../TokenDisplay/ViewToken";
import { UserFundsProps } from "../../models/PropTypes";
import WithdrawFundsFlow from "../Banking/WithdrawFundsFlow";
import { nullToken } from "../../data/gasTokens";
import { showNotification, updateNotification } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
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
  }[];
}
export function UsersTable({ data }: IUserBalanceInfo) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const [weiWithdrawAmount, setWithdraw] = useState(BigNumber.from(0));
  const [selectedToken, setSelectedToken] = useState(nullToken);

  let withdrawActions = WithdrawFundsFlow(selectedToken, weiWithdrawAmount);

  const rows = data.map((item) => (
    <tr key={item.address}>
      <td>
        <ViewToken token={item} />
      </td>
      <td>{item.balance}</td>
      <td>{item.freeBalance}</td>

      <td>
        <Group spacing="xs" position="center">
          <Button
            radius="xl"
            size="md"
            compact
            onMouseOver={() => {
              setSelectedToken(item);
              setWithdraw(parseUnits(item.freeBalance, item.decimals));
            }}
            onClick={() => {
              withdrawActions.action?.();
            }}
          >
            Withdraw Available
          </Button>
          <Button
            color="red"
            radius="xl"
            size="md"
            compact
            onMouseOver={() => {
              setSelectedToken(item);
              setWithdraw(parseUnits(item.balance, item.decimals));
            }}
            onClick={() => {
              withdrawActions.action?.();
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
  return <UsersTable data={parsedTokenBalances ? parsedTokenBalances : []} />;
}
