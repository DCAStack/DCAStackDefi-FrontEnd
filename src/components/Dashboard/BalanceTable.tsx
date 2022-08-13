import {
  Avatar,
  Badge,
  Table,
  Group,
  Text,
  ActionIcon,
  Anchor,
  ScrollArea,
  useMantineTheme,
  Button,
} from "@mantine/core";

import { Pencil, Trash } from "tabler-icons-react";
import { createStyles } from "@mantine/core";

import { useEffect, useState, useContext } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon, ChevronDown } from "tabler-icons-react";
import GasToken from "../TokenDisplay/GasToken";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import swapTokens from "./../../data/swapTokens";
import { forwardRef } from "react";
import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";
import { BigNumber } from "ethers";
import { IUserFunds } from "../../models/Interfaces";
import ViewToken from "../TokenDisplay/ViewToken";
import { UserFundsProps } from "../../models/PropTypes";

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

  const theme = useMantineTheme();
  const rows = data.map((item) => (
    <tr key={item.address}>
      <td>
        <ViewToken token={item} />
      </td>
      <td>{item.balance}</td>
      <td>{item.freeBalance}</td>

      <td>
        <Group spacing="xs" position="center">
          <Button radius="xl" size="md" compact>
            Withdraw Available
          </Button>
          <Button color="red" radius="xl" size="md" compact>
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
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address, isConnecting, isDisconnected } = useAccount();

  return <UsersTable data={parsedTokenBalances ? parsedTokenBalances : []} />;
}
