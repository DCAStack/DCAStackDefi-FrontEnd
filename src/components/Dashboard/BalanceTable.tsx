import { Button, ScrollArea, Stack, Table, Tooltip, Text } from "@mantine/core";

import { createStyles } from "@mantine/core";

import { useEffect, useState } from "react";

import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import { UserFundsProps } from "../../models/PropTypes";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import useWithdrawFundsFlow from "../Banking/WithdrawFundsFlow";
import useRefillTokenDepositFlow from "../Scheduling/RefillTokenDepositFlow";
import { IToken } from "../../models/Interfaces";
import { nullToken } from "../../data/gasTokens";

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
    zIndex: 1,
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
    IToken: IToken;
    balance: string;
    freeBalance: string;
    freeBalanceRaw: BigNumber;
    balanceRaw: BigNumber;
  }[];
}
export function UsersTable({ data }: IUserBalanceInfo) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const [useItem, setItem] = useState<any>({
    IToken: nullToken,
    balance: "0",
    freeBalance: "0",
    freeBalanceRaw: BigNumber.from(0),
  });

  const doMaxWithdraw = useWithdrawFundsFlow(
    useItem?.IToken,
    useItem?.balance
  )?.action;
  const [doMax, setDoMax] = useState(false);

  const doFreeWithdraw = useWithdrawFundsFlow(
    useItem?.IToken,
    useItem?.freeBalance
  )?.action;
  const [doFree, setDoFree] = useState(false);

  const doRefillToken = useRefillTokenDepositFlow(
    useItem?.IToken,
    formatUnits(
      useItem?.freeBalanceRaw.abs().toString(),
      useItem?.IToken.decimals
    )
  )?.refill;
  const [doRefill, setDoRefill] = useState(false);

  useEffect(() => {
    if (doMax) {
      doMaxWithdraw?.();
      setDoMax(false);
    } else if (doFree) {
      doFreeWithdraw?.();
      setDoFree(false);
    } else if (doRefill) {
      doRefillToken?.();
      setDoRefill(false);
    }
  }, [doMax, doFree, doRefill, doFreeWithdraw, doMaxWithdraw, doRefillToken]);

  const rows = data.map((item) => (
    <tr key={item.IToken.address}>
      <td>
        <TokenBadgeDisplay token={item.IToken} />
      </td>
      <td>{parseFloat(`${item.balance}`).toFixed(6)}</td>
      <td>{parseFloat(`${item.freeBalance}`).toFixed(6)}</td>
      <td>
        {parseFloat(
          `${formatUnits(
            item.balanceRaw.sub(item.freeBalanceRaw),
            item.IToken.decimals
          )}`
        ).toFixed(6)}
      </td>

      <td>
        <Stack align="center" spacing="xs">
          {item.freeBalanceRaw.lt(0) && (
            <Button
              radius="xl"
              size="md"
              compact
              onClick={() => {
                setItem(item);
                setDoRefill(true);
              }}
            >
              Topup Deposit
            </Button>
          )}

          {item.freeBalanceRaw.gt(0) && (
            <Button
              radius="xl"
              size="md"
              compact
              onClick={() => {
                setItem(item);
                setDoFree(true);
              }}
            >
              Withdraw Available
            </Button>
          )}

          {item.balanceRaw.gt(0) && !item.freeBalanceRaw.eq(item.balanceRaw) && (
            <Tooltip
              position="bottom"
              wrapLines
              width={220}
              withArrow
              transition="fade"
              transitionDuration={200}
              label="Please note that selecting WITHDRAW ALL will withdraw all tokens
              including those used in schedules which will cause them to not run!"
            >
              <Button
                color="red"
                radius="xl"
                size="md"
                compact
                onClick={() => {
                  setItem(item);
                  setDoMax(true);
                }}
              >
                Withdraw All
              </Button>
            </Tooltip>
          )}
        </Stack>
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
            <th>Free Balance</th>
            <th>In Use Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={5}>
                <Text weight={500} align="center">
                  Nothing found...
                </Text>
              </td>
            </tr>
          )}
        </tbody>
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
          IToken: parsedTokenBalances[Number(key)],
        };

        formattedUserData.push({
          ...parsedTokenBalances[Number(key)],
          ...addDetails,
        });
      }
      return true;
    });
  }

  return <UsersTable data={formattedUserData} />;
}
