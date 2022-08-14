import { useEffect, useState, useContext } from "react";

import {
  Group,
  NumberInput,
  Container,
  Button,
  createStyles,
  UnstyledButton,
  Menu,
  Image,
} from "@mantine/core";
import { ChevronDown } from "tabler-icons-react";

import { useAccount } from "wagmi";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { BigNumber } from "ethers";

import { UserFundsProps } from "../../models/PropTypes";

import WithdrawFundsFlow from "./WithdrawFundsFlow";

const useStyles = createStyles((theme, { opened }: { opened: boolean }) => ({
  control: {
    height: 60,
    width: 200,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    borderRadius: theme.radius.md,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]
    }`,
    transition: "background-color 150ms ease",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[opened ? 5 : 6]
        : opened
        ? theme.colors.gray[0]
        : theme.white,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  label: {
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,
  },

  icon: {
    transition: "transform 150ms ease",
    transform: opened ? "rotate(180deg)" : "rotate(0deg)",
  },
  input: {
    height: 60,
  },
}));

export default function WithdrawFunds({
  userFunds: parsedTokenBalances,
}: UserFundsProps) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [weiWithdrawAmount, setWithdraw] = useState(BigNumber.from(0));
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const [opened, setOpened] = useState(false);
  const { classes } = useStyles({ opened });
  const [selectedToken, setSelectedToken] = useState(
    parsedTokenBalances ? parsedTokenBalances[0] : null
  );

  let withdrawActions = WithdrawFundsFlow(selectedToken, weiWithdrawAmount);

  useEffect(() => {
    //any time token changes, reset input back to 0
    setWithdraw(BigNumber.from(0));
  }, [selectedToken]);

  let items;
  if (parsedTokenBalances) {
    items = parsedTokenBalances.map((item) => (
      <Menu.Item
        icon={<Image src={item.logoURI} width={30} height={30} />}
        onClick={() => setSelectedToken(item)}
        key={item.address}
      >
        {item.balance}&nbsp;
        {item.symbol}
      </Menu.Item>
    ));
  }

  return (
    <Container my="withdraw_funds">
      <Group align="end" position="center" spacing="xs">
        <Menu
          transition="pop"
          transitionDuration={150}
          onOpen={() => setOpened(true)}
          onClose={() => setOpened(false)}
          radius="md"
          control={
            <UnstyledButton className={classes.control}>
              <Group spacing="xs">
                <Image src={selectedToken?.logoURI} width={30} height={30} />
                <span className={classes.label}>
                  {selectedToken?.balance}&nbsp;{selectedToken?.symbol}
                </span>
              </Group>
              <ChevronDown size={16} className={classes.icon} />
            </UnstyledButton>
          }
        >
          {items}
        </Menu>
        <NumberInput
          precision={selectedToken?.decimals}
          value={Number(
            formatUnits(weiWithdrawAmount, selectedToken?.decimals)
          )}
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) =>
            val
              ? setWithdraw(parseUnits(String(val), selectedToken?.decimals))
              : setWithdraw(BigNumber.from(0))
          }
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xs"
              size="md"
              onClick={() => {
                withdrawActions?.max
                  ? setWithdraw(BigNumber.from(withdrawActions?.max))
                  : setWithdraw(BigNumber.from(0));
              }}
            >
              MAX
            </Button>
          }
          rightSectionWidth={65}
        />
        <Button
          compact
          className={classes.input}
          radius="xs"
          size="xl"
          onClick={() =>
            withdrawActions?.action ? withdrawActions?.action?.() : null
          }
        >
          Withdraw
        </Button>{" "}
      </Group>
    </Container>
  );
}
