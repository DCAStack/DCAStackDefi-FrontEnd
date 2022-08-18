import { useState, useEffect, ChangeEvent } from "react";

import {
  Group,
  TextInput,
  Container,
  Button,
  createStyles,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import { formatUnits } from "ethers/lib/utils";
import { TokenBadgeProps } from "../../models/PropTypes";

import { BigNumber } from "ethers";
import DepositFundsFlow from "./DepositFundsFlow";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositFunds({
  token,
  weiDefaultValue = BigNumber.from(0),
}: TokenBadgeProps) {
  const [depositAmount, setDeposit] = useState("0");
  const { classes } = useStyles();

  let depositTokenActions = DepositFundsFlow(token, depositAmount);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const re = /^\d*\.?\d*$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      setDeposit(event.target.value);
    }
  };

  useEffect(() => {
    if (token?.decimals) {
      setDeposit(formatUnits(weiDefaultValue, token?.decimals).toString());
    }
  }, [token?.decimals, weiDefaultValue]);

  return (
    <Container my="deposit_funds">
      <Group align="end" position="center" spacing="xs">
        <TextInput
          styles={{
            input: {
              textAlign: "center",
            },
          }}
          value={depositAmount?.toString()}
          label="Deposit DCA Amount"
          radius="xs"
          size="xl"
          onChange={handleChange}
          icon={<TokenBadgeDisplay token={token} />}
          iconWidth={115}
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xl"
              size="md"
              onClick={() =>
                depositTokenActions?.max
                  ? setDeposit(
                      formatUnits(
                        depositTokenActions?.max?.value.toString(),
                        token?.decimals
                      )
                    )
                  : setDeposit("0")
              }
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
          onClick={() => {
            if (depositTokenActions?.approveMax) {
              //regular token
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
                  token?.decimals
                ) === "0.0"
                  ? depositTokenActions?.approve?.()
                  : depositTokenActions?.deposit?.();
              }
            }
          }}
        >
          &nbsp;Deposit&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}
