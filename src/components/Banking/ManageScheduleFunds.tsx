import { ChangeEvent, useEffect, useState } from "react";

import {
  Button,
  Container,
  createStyles,
  Group,
  Image,
  Menu,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { ChevronDown } from "tabler-icons-react";

import { formatUnits } from "ethers/lib/utils";

import { UserFundsProps } from "../../models/PropTypes";

import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import DepositEthFundsFlow from "./DepositEthFundsFlow";
import DepositFundsFlow from "./DepositFundsFlow";
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

export default function ManageScheduleFunds({
  userFunds: parsedTokenBalances,
}: UserFundsProps) {
  const [amount, setAmount] = useState("0");
  const [opened, setOpened] = useState(false);
  const { classes } = useStyles({ opened });
  const [selectedToken, setSelectedToken] = useState(
    parsedTokenBalances ? parsedTokenBalances[0] : null
  );

  let withdrawActions = WithdrawFundsFlow(selectedToken, amount);

  let depositEthActions = DepositEthFundsFlow(selectedToken, amount);
  let depositTokenActions = DepositFundsFlow(selectedToken, amount);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const re = /^\d*\.?\d*$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      setAmount(event.target.value);
    }
  };

  useEffect(() => {
    //any time token changes, reset input back to 0
    setAmount("0");
  }, [selectedToken]);

  let items;
  if (parsedTokenBalances) {
    items = parsedTokenBalances.map((item) => (
      <Menu.Item
        icon={<Image src={item.logoURI} width={30} height={30} />}
        onClick={() => setSelectedToken(item)}
        key={item.address}
      >
        ~ {parseFloat(`${item.balance}`).toFixed(2)}&nbsp;
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
                  ~ {parseFloat(`${selectedToken?.balance}`).toFixed(2)}&nbsp;
                  {selectedToken?.symbol}
                </span>
              </Group>
              <ChevronDown size={16} className={classes.icon} />
            </UnstyledButton>
          }
        >
          {items}
        </Menu>
        <TextInput
          styles={{
            input: {
              textAlign: "center",
            },
          }}
          value={amount?.toString()}
          radius="xs"
          size="xl"
          onChange={handleChange}
        />
        <Button
          compact
          className={classes.input}
          radius="xs"
          size="xl"
          onClick={() => {
            if (
              selectedToken?.address.toLowerCase() ===
              "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
            ) {
              if (depositEthActions?.max?.formatted === "0.0") {
                showNotification({
                  id: "deposit-eth-error",
                  color: "red",
                  title: "Insufficient Balance",
                  message:
                    "If this was unexpected, please raise an issue on github!",
                  autoClose: true,
                  disallowClose: false,
                  icon: <AlertOctagon />,
                });
              } else {
                depositEthActions?.deposit?.();
              }
            } else {
              if (depositTokenActions?.approveMax) {
                if (depositTokenActions?.max?.formatted === "0.0") {
                  showNotification({
                    id: "deposit-balance-error",
                    color: "red",
                    title: "Insufficient Balance",
                    message:
                      "If this was unexpected, please raise an issue on github!",
                    autoClose: true,
                    disallowClose: false,
                    icon: <AlertOctagon />,
                  });
                } else {
                  formatUnits(
                    depositTokenActions?.approveMax,
                    selectedToken?.decimals
                  ) === "0.0"
                    ? depositTokenActions?.approve?.()
                    : depositTokenActions?.deposit?.();
                }
              }
            }
          }}
        >
          Deposit
        </Button>{" "}
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
