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

interface UsersTableProps {
  data: {
    avatar: string;
    name: string;
    job: string;
    email: string;
  }[];
}

interface IUserBalanceInfo {
  data: {
    logoURI: string;
    symbol: string;
    address: string;
    name: string;
    decimals: number;
    balance: string;
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
      <td>{item.balance}</td>

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
      >
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Token</th>
            <th>Total Balance</th>
            <th>Available Balance Not Used in Schedules</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

const randomData = {
  data: [
    {
      avatar:
        "https://images.unsplash.com/photo-1624298357597-fd92dfbec01d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
      name: "Robert Wolfkisser",
      job: "Engineer",
      email: "rob_wolf@gmail.com",
    },
    {
      avatar:
        "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
      name: "Jill Jailbreaker",
      job: "Engineer",
      email: "jj@breaker.com",
    },
    {
      avatar:
        "https://images.unsplash.com/photo-1632922267756-9b71242b1592?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
      name: "Henry Silkeater",
      job: "Designer",
      email: "henry@silkeater.io",
    },
    {
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
      name: "Bill Horsefighter",
      job: "Designer",
      email: "bhorsefighter@gmail.com",
    },
    {
      avatar:
        "https://images.unsplash.com/photo-1630841539293-bd20634c5d72?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
      name: "Jeremy Footviewer",
      job: "Manager",
      email: "jeremy@foot.dev",
    },
  ],
};

export function UserBalancesPopulated({
  userFunds: parsedTokenBalances,
}: UserFundsProps) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address, isConnecting, isDisconnected } = useAccount();

  return <UsersTable data={parsedTokenBalances ? parsedTokenBalances : []} />;
}
