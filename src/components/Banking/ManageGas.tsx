import { ChangeEvent, useEffect, useState } from "react";

import { Button, Container, Group, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  AlertOctagon,
  ArrowBigLeftLine,
  ArrowBigLeftLines,
  ArrowBigRightLine,
  ArrowBigRightLines,
} from "tabler-icons-react";
import GasToken from "../TokenDisplay/GasToken";

import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import DepositGasFlow from "./DepositGasFlow";
import WithdrawGasFlow from "./WithdrawGasFlow";
import { Menu, useMantineTheme } from "@mantine/core";
import { ChevronDown } from "tabler-icons-react";

interface ISetup {
  weiDefaultValue?: BigNumber;
  enableWithdraw?: boolean;
}

export default function ManageGas({
  weiDefaultValue = BigNumber.from(0),
  enableWithdraw = false,
}: ISetup) {
  const theme = useMantineTheme();

  const [gasAmount, setAmount] = useState("0");
  const [updateState, setUpdate] = useState(true);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const re = /^\d*\.?\d*$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      setAmount(event.target.value);
      setUpdate(false);
    }
  };

  useEffect(() => {
    if (updateState) {
      setAmount(formatEther(weiDefaultValue.toString()));
    }
  }, [weiDefaultValue, updateState]);

  let depositGasActions = DepositGasFlow(gasAmount);
  let withdrawGasActions = WithdrawGasFlow(gasAmount);

  return (
    <Container my="manage_gas">
      <Group align="end" position="center" spacing="xs">
        <TextInput
          styles={{
            input: {
              textAlign: "center",
            },
          }}
          value={gasAmount?.toString()}
          label="Fund Gas Amount"
          radius="xs"
          size="xl"
          onChange={handleChange}
          icon={<GasToken />}
          iconWidth={115}
        />

        <Menu
          control={
            <Button
              radius="xs"
              size="xl"
              rightIcon={<ChevronDown size={18} />}
              sx={{ paddingRight: 12 }}
            >
              Fund
            </Button>
          }
          transition="pop-top-right"
          position="top"
          size="lg"
        >
          <Menu.Item
            icon={<ArrowBigLeftLine size={26} color={theme.colors.blue[6]} />}
            onClick={() => {
              if (depositGasActions?.max?.formatted === "0.0") {
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
                depositGasActions?.deposit?.();
              }
            }}
          >
            Deposit
          </Menu.Item>

          <Menu.Item
            icon={<ArrowBigLeftLines size={26} color={theme.colors.pink[6]} />}
            onClick={() => {
              if (depositGasActions?.max?.formatted === "0.0") {
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
                setAmount(
                  depositGasActions?.max?.formatted
                    ? depositGasActions?.max?.formatted
                    : "0"
                );
              }
            }}
          >
            Get Max Deposit
          </Menu.Item>

          {enableWithdraw && (
            <Menu.Item
              icon={
                <ArrowBigRightLine size={26} color={theme.colors.cyan[6]} />
              }
              onClick={() => {
                if (withdrawGasActions?.max === "0.0") {
                  showNotification({
                    id: "withdraw-balance-error",
                    color: "red",
                    title: "Insufficient Balance",
                    message:
                      "If this was unexpected, please raise an issue on github!",
                    autoClose: true,
                    disallowClose: false,
                    icon: <AlertOctagon />,
                  });
                } else {
                  withdrawGasActions?.withdraw?.();
                }
              }}
            >
              Withdraw
            </Menu.Item>
          )}

          {enableWithdraw && (
            <Menu.Item
              icon={
                <ArrowBigRightLines size={26} color={theme.colors.violet[6]} />
              }
              onClick={() => {
                if (withdrawGasActions?.max === "0.0") {
                  showNotification({
                    id: "withdraw-balance-error",
                    color: "red",
                    title: "Insufficient Balance",
                    message:
                      "If this was unexpected, please raise an issue on github!",
                    autoClose: true,
                    disallowClose: false,
                    icon: <AlertOctagon />,
                  });
                } else {
                  setAmount(withdrawGasActions?.max);
                }
              }}
            >
              Get Max Withdrraw
            </Menu.Item>
          )}
        </Menu>
      </Group>
    </Container>
  );
}
